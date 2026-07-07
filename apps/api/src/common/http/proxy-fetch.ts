import { Buffer } from "node:buffer";
import * as http from "node:http";
import type { Socket } from "node:net";
import * as tls from "node:tls";
import * as zlib from "node:zlib";

const DEFAULT_PROXY_TIMEOUT_MS = 30_000;
const originalFetch = globalThis.fetch.bind(globalThis);
let proxyFetchConfigured = false;

export function configureProxyFetchFromEnv(): void {
  if (proxyFetchConfigured) {
    return;
  }

  const proxy = readProxyUrl();

  if (!proxy) {
    return;
  }

  proxyFetchConfigured = true;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const target = new URL(request.url);

    if (target.protocol !== "https:" || shouldBypassProxy(target.hostname)) {
      return originalFetch(request);
    }

    return fetchThroughHttpProxy(request, target, proxy);
  }) as typeof fetch;

  console.log(`Outbound HTTPS proxy enabled via ${maskProxyUrl(proxy)}`);
}

function readProxyUrl(): URL | null {
  const rawProxy =
    process.env.HTTPS_PROXY ??
    process.env.https_proxy ??
    process.env.HTTP_PROXY ??
    process.env.http_proxy;

  if (!rawProxy?.trim()) {
    return null;
  }

  const normalizedProxy = rawProxy.includes("://") ? rawProxy : `http://${rawProxy}`;
  const proxy = new URL(normalizedProxy);

  if (proxy.protocol !== "http:") {
    console.warn(`Ignoring unsupported proxy protocol: ${proxy.protocol}`);
    return null;
  }

  return proxy;
}

async function fetchThroughHttpProxy(request: Request, target: URL, proxy: URL): Promise<Response> {
  const body = await readRequestBody(request);
  const targetPort = target.port || "443";

  return new Promise<Response>((resolve, reject) => {
    let settled = false;
    let proxySocket: Socket | undefined;
    let secureSocket: tls.TLSSocket | undefined;

    const cleanup = () => {
      request.signal.removeEventListener("abort", abortRequest);
    };

    const fail = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      proxySocket?.destroy();
      secureSocket?.destroy();
      reject(error);
    };

    const finish = (response: Response) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(response);
    };

    const abortRequest = () => {
      fail(new DOMException("This operation was aborted.", "AbortError"));
    };

    if (request.signal.aborted) {
      abortRequest();
      return;
    }

    request.signal.addEventListener("abort", abortRequest, { once: true });

    const connectRequest = http.request({
      host: proxy.hostname,
      port: Number(proxy.port || 80),
      method: "CONNECT",
      path: `${target.hostname}:${targetPort}`,
      headers: createProxyHeaders(proxy, target, targetPort),
      timeout: DEFAULT_PROXY_TIMEOUT_MS
    });

    connectRequest.once("timeout", () => {
      connectRequest.destroy(new Error("Proxy CONNECT request timed out."));
    });

    connectRequest.once("error", fail);

    connectRequest.once("connect", (connectResponse, socket, head) => {
      if (connectResponse.statusCode !== 200) {
        socket.destroy();
        fail(new Error(`Proxy CONNECT failed with status ${connectResponse.statusCode ?? "unknown"}.`));
        return;
      }

      proxySocket = socket;

      if (head.length > 0) {
        socket.unshift(head);
      }

      const tlsSocket = tls.connect({
        socket,
        servername: target.hostname
      });
      secureSocket = tlsSocket;

      const responseChunks: Buffer[] = [];

      tlsSocket.once("error", fail);
      tlsSocket.once("secureConnect", () => {
        writeTargetRequest(tlsSocket, request, target, body);
      });
      tlsSocket.on("data", (chunk) => {
        responseChunks.push(Buffer.from(chunk));
      });
      tlsSocket.once("end", () => {
        try {
          finish(createFetchResponse(Buffer.concat(responseChunks)));
        } catch (error) {
          fail(error);
        }
      });
    });

    connectRequest.end();
  });
}

async function readRequestBody(request: Request): Promise<Buffer | null> {
  if (!request.body) {
    return null;
  }

  return Buffer.from(await request.arrayBuffer());
}

function createProxyHeaders(proxy: URL, target: URL, targetPort: string): Record<string, string> {
  const headers: Record<string, string> = {
    Host: `${target.hostname}:${targetPort}`,
    "Proxy-Connection": "Keep-Alive"
  };

  if (proxy.username || proxy.password) {
    headers["Proxy-Authorization"] = `Basic ${Buffer.from(
      `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`
    ).toString("base64")}`;
  }

  return headers;
}

function writeTargetRequest(
  socket: tls.TLSSocket,
  request: Request,
  target: URL,
  body: Buffer | null
): void {
  const headerLines: string[] = [];

  request.headers.forEach((value, key) => {
    if (!isManagedHeader(key)) {
      headerLines.push(`${key}: ${value}`);
    }
  });

  headerLines.push(`Host: ${target.host}`);
  headerLines.push("Connection: close");
  headerLines.push("Accept-Encoding: identity");

  if (body) {
    headerLines.push(`Content-Length: ${body.length}`);
  }

  socket.write(`${request.method} ${target.pathname}${target.search} HTTP/1.1\r\n`);
  socket.write(`${headerLines.join("\r\n")}\r\n\r\n`);

  if (body) {
    socket.write(body);
  }
}

function isManagedHeader(key: string): boolean {
  return [
    "accept-encoding",
    "connection",
    "content-length",
    "host",
    "proxy-authorization",
    "proxy-connection",
    "transfer-encoding"
  ].includes(key.toLowerCase());
}

function createFetchResponse(rawResponse: Buffer): Response {
  const headerEnd = rawResponse.indexOf("\r\n\r\n");

  if (headerEnd < 0) {
    throw new Error("Invalid HTTP response received through proxy.");
  }

  const headerText = rawResponse.subarray(0, headerEnd).toString("latin1");
  const [statusLine = "", ...headerLines] = headerText.split("\r\n");
  const statusMatch = /^HTTP\/\d\.\d\s+(\d+)\s*(.*)$/.exec(statusLine);

  if (!statusMatch) {
    throw new Error("Invalid HTTP status received through proxy.");
  }

  const headers = new Headers();

  for (const line of headerLines) {
    const separator = line.indexOf(":");

    if (separator > 0) {
      headers.append(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
  }

  const status = Number(statusMatch[1] ?? 0);
  const statusText = statusMatch[2] ?? "";
  const body = canResponseHaveBody(status)
    ? toArrayBuffer(decodeResponseBody(rawResponse.subarray(headerEnd + 4), headers))
    : null;

  return new Response(body, {
    status,
    statusText,
    headers
  });
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  new Uint8Array(arrayBuffer).set(buffer);

  return arrayBuffer;
}

function decodeResponseBody(body: Buffer, headers: Headers): Buffer {
  let decoded = body;

  if ((headers.get("transfer-encoding") ?? "").toLowerCase().includes("chunked")) {
    decoded = decodeChunkedBody(decoded);
  }

  const contentEncoding = (headers.get("content-encoding") ?? "").toLowerCase();

  if (contentEncoding === "gzip") {
    return zlib.gunzipSync(decoded);
  }

  if (contentEncoding === "deflate") {
    return zlib.inflateSync(decoded);
  }

  if (contentEncoding === "br") {
    return zlib.brotliDecompressSync(decoded);
  }

  return decoded;
}

function decodeChunkedBody(body: Buffer): Buffer {
  const chunks: Buffer[] = [];
  let offset = 0;

  while (offset < body.length) {
    const lineEnd = body.indexOf("\r\n", offset);

    if (lineEnd < 0) {
      break;
    }

    const sizeToken = (body.subarray(offset, lineEnd).toString("latin1").split(";")[0] ?? "").trim();
    const size = Number.parseInt(sizeToken, 16);

    if (!Number.isFinite(size)) {
      break;
    }

    offset = lineEnd + 2;

    if (size === 0) {
      break;
    }

    chunks.push(body.subarray(offset, offset + size));
    offset += size + 2;
  }

  return Buffer.concat(chunks);
}

function canResponseHaveBody(status: number): boolean {
  return status !== 204 && status !== 205 && status !== 304;
}

function shouldBypassProxy(hostname: string): boolean {
  const noProxy = process.env.NO_PROXY ?? process.env.no_proxy;

  if (!noProxy) {
    return false;
  }

  return noProxy
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry === "*") {
        return true;
      }

      const host = entry.startsWith(".") ? entry.slice(1) : entry;

      return hostname.toLowerCase() === host || hostname.toLowerCase().endsWith(`.${host}`);
    });
}

function maskProxyUrl(proxy: URL): string {
  const auth = proxy.username || proxy.password ? "***@" : "";

  return `${proxy.protocol}//${auth}${proxy.host}`;
}
