export function isValidGitHubRepositoryUrl(value: string): boolean {
  const input = value.trim();
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  try {
    const url = new URL(withProtocol);
    const segments = url.pathname.split("/").filter(Boolean);
    const [owner, rawRepo] = segments;
    const repo = rawRepo?.replace(/\.git$/i, "");

    return (
      (url.hostname === "github.com" || url.hostname === "www.github.com") &&
      segments.length === 2 &&
      Boolean(owner) &&
      Boolean(repo) &&
      /^[a-z\d](?:[a-z\d-]{0,38}[a-z\d])?$/i.test(owner ?? "") &&
      /^[a-z\d._-]+$/i.test(repo ?? "")
    );
  } catch {
    return false;
  }
}
