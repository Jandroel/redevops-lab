import { Injectable } from "@nestjs/common";
import { analyzeGitHubRepository } from "@redevops-lab/analyzer";
import type { RepositoryAnalysis } from "@redevops-lab/shared";

@Injectable()
export class GitHubService {
  analyzePublicRepository(url: string): Promise<RepositoryAnalysis> {
    return analyzeGitHubRepository(url, {
      token: process.env.GITHUB_TOKEN || undefined,
      userAgent: "redevops-lab",
      maxTreeItems: 5000,
      timeoutMs: 15_000,
      maxContentFiles: 10,
      maxContentFileBytes: 96_000,
      maxContentBytes: 480_000,
      contentTimeoutMs: 8_000
    });
  }
}
