import type { RepositoryMetadata, RepoTreeItem } from "@redevops-lab/shared";
import { filterRepoTree, normalizeRepoTreeItem } from "./repo-tree.js";
import type { FilteredRepoTree } from "./repo-tree.js";

export interface GitHubClientOptions {
  token?: string;
  userAgent?: string;
  timeoutMs?: number;
  maxTreeItems?: number;
}

export class GitHubAnalyzerError extends Error {
  constructor(
    readonly code:
      | "not_found"
      | "rate_limited"
      | "empty_repository"
      | "unexpected_response"
      | "timeout"
      | "network_error",
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "GitHubAnalyzerError";
  }
}

interface GitHubRepositoryResponse {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  pushed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  owner: {
    login: string;
  };
  license: {
    spdx_id?: string;
    name?: string;
  } | null;
}

interface GitHubTreeResponse {
  tree?: Array<{
    path?: string;
    type?: string;
    size?: number;
  }>;
  truncated?: boolean;
}

export async function fetchGitHubRepositoryMetadata(
  owner: string,
  repo: string,
  options: GitHubClientOptions = {}
): Promise<RepositoryMetadata> {
  const response = await githubRequest<GitHubRepositoryResponse>(
    `https://api.github.com/repos/${owner}/${repo}`,
    options
  );

  return {
    provider: "github",
    owner: response.owner.login,
    name: response.name,
    fullName: response.full_name,
    url: response.html_url,
    description: response.description,
    defaultBranch: response.default_branch,
    stars: response.stargazers_count,
    forks: response.forks_count,
    openIssues: response.open_issues_count,
    license: response.license?.spdx_id ?? response.license?.name ?? null,
    isPrivate: response.private,
    pushedAt: response.pushed_at,
    createdAt: response.created_at,
    updatedAt: response.updated_at
  };
}

export async function fetchGitHubRepositoryTree(
  owner: string,
  repo: string,
  branch: string,
  options: GitHubClientOptions = {}
): Promise<FilteredRepoTree> {
  const response = await githubRequest<GitHubTreeResponse>(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    options
  );

  if (!Array.isArray(response.tree)) {
    throw new GitHubAnalyzerError(
      "unexpected_response",
      "GitHub returned an unexpected repository tree response.",
      502
    );
  }

  const rawTree: RepoTreeItem[] = response.tree
    .filter((item) => typeof item.path === "string")
    .map((item) =>
      normalizeRepoTreeItem({
        path: item.path ?? "",
        type: item.type,
        size: item.size
      })
    );

  if (rawTree.length === 0) {
    throw new GitHubAnalyzerError("empty_repository", "The repository appears to be empty.", 409);
  }

  const filtered = filterRepoTree(rawTree, { maxTreeItems: options.maxTreeItems });

  if (response.truncated) {
    filtered.warnings.push("GitHub marked the repository tree response as truncated.");
    filtered.stats.truncated = true;
  }

  return filtered;
}

async function githubRequest<T>(url: string, options: GitHubClientOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": options.userAgent ?? "redevops-lab"
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      throw await mapGitHubError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof GitHubAnalyzerError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new GitHubAnalyzerError(
        "timeout",
        `GitHub request timed out after ${timeoutMs}ms while analyzing the repository.`,
        504
      );
    }

    throw new GitHubAnalyzerError("network_error", createNetworkErrorMessage(error), 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function mapGitHubError(response: Response): Promise<GitHubAnalyzerError> {
  const message = await readGitHubErrorMessage(response);

  if (response.status === 404) {
    return new GitHubAnalyzerError(
      "not_found",
      "GitHub repository was not found or is not public.",
      404
    );
  }

  if (response.status === 401 || response.status === 403) {
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    const rateLimited = rateLimitRemaining === "0" || message.toLowerCase().includes("rate limit");

    return new GitHubAnalyzerError(
      "rate_limited",
      rateLimited
        ? "GitHub rate limit reached. Configure GITHUB_TOKEN or try again later."
        : "GitHub access was restricted while analyzing the repository.",
      403
    );
  }

  if (response.status === 409) {
    return new GitHubAnalyzerError("empty_repository", "The repository appears to be empty.", 409);
  }

  return new GitHubAnalyzerError(
    "unexpected_response",
    message ? `GitHub returned an unexpected response: ${message}` : "GitHub returned an unexpected response.",
    502
  );
}

async function readGitHubErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };

    return typeof body.message === "string" ? body.message : "";
  } catch {
    return "";
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function createNetworkErrorMessage(error: unknown): string {
  const cause = error instanceof Error && "cause" in error ? String(error.cause) : "";

  if (cause.toLowerCase().includes("connecttimeout")) {
    return "Could not reach GitHub from the API runtime before the connection timed out.";
  }

  return "Could not reach GitHub while analyzing the repository.";
}
