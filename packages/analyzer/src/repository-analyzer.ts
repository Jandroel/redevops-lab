import type { RepositoryAnalysis } from "@redevops-lab/shared";
import { analyzeRepositoryContents } from "./content-analyzer.js";
import { selectRepositoryContentFiles } from "./content-selector.js";
import { detectDevOpsSignals } from "./devops-detector.js";
import {
  fetchGitHubRepositoryContents,
  fetchGitHubRepositoryMetadata,
  fetchGitHubRepositoryTree
} from "./github-client.js";
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
  const contentSelection = selectRepositoryContentFiles(treeResult.tree, options);
  const fetchedContent = await fetchGitHubRepositoryContents(
    repository.owner,
    repository.name,
    repository.defaultBranch ?? "main",
    contentSelection.files,
    options
  );
  const contentAnalysis = analyzeRepositoryContents({
    files: fetchedContent.files,
    selection: contentSelection,
    failedFiles: fetchedContent.failedFiles,
    warnings: fetchedContent.warnings
  });

  return {
    repository,
    tree: treeResult.tree,
    importantFiles: treeResult.importantFiles,
    devopsSignals,
    detectedStack,
    contentAnalysis,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    warnings: treeResult.warnings,
    treeStats: treeResult.stats
  };
}
