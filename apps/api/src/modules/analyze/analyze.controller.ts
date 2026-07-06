import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { DevOpsReport } from "@redevops-lab/shared";
import { AnalyzeService } from "./analyze.service.js";
import { AnalyzeRepositoryDto } from "./dto/analyze-repository.dto.js";

@ApiTags("analyze")
@Controller("analyze")
export class AnalyzeController {
  constructor(private readonly analyzeService: AnalyzeService) {}

  @Post()
  @ApiOperation({ summary: "Analyze a public GitHub repository and return a DevOps report." })
  @ApiBody({ type: AnalyzeRepositoryDto })
  @ApiResponse({
    status: 201,
    description:
      "DevOps report generated from public GitHub metadata, tree data, analyzer signals, rule-based scoring, production checklist, learning path, hands-on labs, and optional AI mentor enhancement."
  })
  @ApiResponse({
    status: 400,
    description: "The submitted URL is not a valid GitHub repository URL."
  })
  @ApiResponse({ status: 403, description: "GitHub rate limit reached or access was restricted." })
  @ApiResponse({ status: 404, description: "Repository was not found or is not public." })
  @ApiResponse({ status: 409, description: "Repository is empty." })
  @ApiResponse({ status: 502, description: "GitHub returned an unexpected response." })
  analyze(@Body() input: AnalyzeRepositoryDto): Promise<DevOpsReport> {
    return this.analyzeService.analyzeRepository(input);
  }
}
