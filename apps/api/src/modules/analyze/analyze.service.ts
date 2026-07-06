import { BadRequestException, HttpException, Inject, Injectable } from "@nestjs/common";
import { detectInitialFindings, GitHubAnalyzerError, parseGitHubUrl } from "@redevops-lab/analyzer";
import type { DevOpsReport } from "@redevops-lab/shared";
import { AiService } from "../ai/ai.service.js";
import { GitHubService } from "../github/github.service.js";
import { createAnalyzedDevOpsReport } from "../reports/report.mock.js";
import type { AnalyzeRepositoryDto } from "./dto/analyze-repository.dto.js";

@Injectable()
export class AnalyzeService {
  constructor(
    @Inject(GitHubService)
    private readonly githubService: GitHubService,
    @Inject(AiService)
    private readonly aiService: AiService
  ) {}

  async analyzeRepository(input: AnalyzeRepositoryDto): Promise<DevOpsReport> {
    const repository = parseGitHubUrl(input.url);

    if (!repository) {
      throw new BadRequestException("Invalid GitHub repository URL.");
    }

    try {
      const analysis = await this.githubService.analyzePublicRepository(repository.url);
      const findings = detectInitialFindings(analysis);
      const report = createAnalyzedDevOpsReport(
        {
          url: repository.url,
          level: input.level,
          language: input.language,
          mentorMode: input.mentorMode
        },
        analysis,
        findings
      );

      return this.aiService.enhanceReport(report, input.mentorMode);
    } catch (error) {
      if (isGitHubAnalyzerError(error)) {
        throw new HttpException(error.message, error.statusCode);
      }

      throw error;
    }
  }
}

function isGitHubAnalyzerError(error: unknown): error is GitHubAnalyzerError {
  if (error instanceof GitHubAnalyzerError) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const record = error as Record<string, unknown>;

  return (
    record.name === "GitHubAnalyzerError" &&
    typeof record.message === "string" &&
    typeof record.statusCode === "number"
  );
}
