import type { RepositoryAnalysis } from "@redevops-lab/shared";
import { detectDevOpsSignals } from "./devops-detector.js";
import { fetchGitHubRepositoryMetadata, fetchGitHubRepositoryTree } from "./github-client.js";
import type { GitHubClientOptions } from "./github-client.js";
import { parseGitHubUrl } from "./github-url.js";
import { detectStack } from "./stack-detector.js";

export interface AnalyzeGitHubRepositoryOptions extends GitHubClientOptions {
  generatedAt?: string;
}

export async function analyzeGitHubRepository(
  url: string,
  options: AnalyzeGitHubRepositoryOptions = {}
): Promise<RepositoryAnalysis> {
  const parsed = parseGitHubUrl(url);

  if (!parsed) {
    throw new Error("Invalid GitHub repository URL.");
  }

  const repository = await fetchGitHubRepositoryMetadata(parsed.owner, parsed.repo, options);
  const treeResult = await fetchGitHubRepositoryTree(
    repository.owner,
    repository.name,
    repository.defaultBranch ?? "main",
    options
  );
  const detectedStack = detectStack(treeResult.tree);
  const devopsSignals = detectDevOpsSignals(treeResult.tree);

  return {
    repository,
    tree: treeResult.tree,
    importantFiles: treeResult.importantFiles,
    devopsSignals,
    detectedStack,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    warnings: treeResult.warnings,
    treeStats: treeResult.stats
  };
}
