import type { DevOpsReport, RepositoryInput } from "@redevops-lab/shared";

const defaultApiUrl = "http://localhost:3001/api";

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, "");
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[]; error?: string };
    const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;

    return message ?? body.error ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new ApiClientError(await parseError(response), response.status);
  }

  return (await response.json()) as T;
}

export function analyzeRepository(input: RepositoryInput): Promise<DevOpsReport> {
  return requestJson<DevOpsReport>("/analyze", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getDemoReport(): Promise<DevOpsReport> {
  return requestJson<DevOpsReport>("/reports/demo");
}

export function getReport(id: string): Promise<DevOpsReport> {
  return requestJson<DevOpsReport>(`/reports/${encodeURIComponent(id)}`);
}

export async function getReportMarkdown(id: string): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/reports/${encodeURIComponent(id)}/export`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new ApiClientError(await parseError(response), response.status);
  }

  return response.text();
}
