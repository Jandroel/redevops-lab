import { Module } from "@nestjs/common";
import { GitHubModule } from "../github/github.module.js";
import { AnalyzeController } from "./analyze.controller.js";
import { AnalyzeService } from "./analyze.service.js";

@Module({
  imports: [GitHubModule],
  controllers: [AnalyzeController],
  providers: [AnalyzeService]
})
export class AnalyzeModule {}
