export interface ParsedGitHubRepository {
  owner: string;
  repo: string;
  fullName: string;
  normalizedUrl: string;
  url: string;
}

const ownerPattern = /^[a-z\d](?:[a-z\d-]{0,38}[a-z\d])?$/i;
const repoPattern = /^[a-z\d._-]+$/i;

export function parseGitHubUrl(url: string): ParsedGitHubRepository | null {
  const value = url.trim();

  if (!value) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.toLowerCase();
    const isGitHub = hostname === "github.com" || hostname === "www.github.com";
    const segments = parsed.pathname.split("/").filter(Boolean);
    const [owner, rawRepo] = segments;

    if (!isGitHub || segments.length !== 2 || !owner || !rawRepo) {
      return null;
    }

    const repo = rawRepo.replace(/\.git$/i, "");

    if (!ownerPattern.test(owner) || !repoPattern.test(repo) || repo === "." || repo === "..") {
      return null;
    }

    const normalizedUrl = `https://github.com/${owner}/${repo}`;

    return {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      normalizedUrl,
      url: normalizedUrl
    };
  } catch {
    return null;
  }
}
