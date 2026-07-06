import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { GitHubModule } from "../github/github.module.js";
import { AnalyzeController } from "./analyze.controller.js";
import { AnalyzeService } from "./analyze.service.js";

@Module({
  imports: [AiModule, GitHubModule],
  controllers: [AnalyzeController],
  providers: [AnalyzeService]
})
export class AnalyzeModule {}
