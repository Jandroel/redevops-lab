import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { detectInitialFindings, GitHubAnalyzerError, parseGitHubUrl } from "@redevops-lab/analyzer";
import type { DevOpsReport } from "@redevops-lab/shared";
import { AiService } from "../ai/ai.service.js";
import { GitHubService } from "../github/github.service.js";
import { createAnalyzedDevOpsReport } from "../reports/report.mock.js";
import type { AnalyzeRepositoryDto } from "./dto/analyze-repository.dto.js";

@Injectable()
export class AnalyzeService {
  constructor(
    private readonly githubService: GitHubService,
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
          language: input.language
        },
        analysis,
        findings
      );

      return this.aiService.enhanceReport(report);
    } catch (error) {
      if (error instanceof GitHubAnalyzerError) {
        throw new HttpException(error.message, error.statusCode);
      }

      throw error;
    }
  }
}
