export { analyzeGitHubRepository } from "./repository-analyzer.js";
export type { AnalyzeGitHubRepositoryOptions } from "./repository-analyzer.js";
export { detectDevOpsSignals } from "./devops-detector.js";
export { detectInitialFindings } from "./findings-detector.js";
export {
  fetchGitHubRepositoryMetadata,
  fetchGitHubRepositoryTree,
  GitHubAnalyzerError
} from "./github-client.js";
export type { GitHubClientOptions } from "./github-client.js";
export { parseGitHubUrl } from "./github-url.js";
export type { ParsedGitHubRepository } from "./github-url.js";
export { detectImportantFiles, filterRepoTree, getPathExtension, normalizeRepoTreeItem } from "./repo-tree.js";
export { detectStack } from "./stack-detector.js";

export function detectRepositoryStackPlaceholder() {
  // TODO: Replace with file-tree based detection in Phase 3.
  return [
    { name: "TypeScript", category: "language", confidence: 0.8 },
    { name: "Node.js", category: "backend", confidence: 0.7 }
  ] as const;
}
