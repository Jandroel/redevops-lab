import { Injectable, NotFoundException } from "@nestjs/common";
import type { DevOpsReport } from "@redevops-lab/shared";
import { AiService } from "../ai/ai.service.js";
import { createDemoReport } from "./report.mock.js";
import { createReportMarkdown } from "./report-markdown.js";

const demoReportIds = new Set(["demo", "demo-jandroel-redevops-lab"]);

@Injectable()
export class ReportsService {
  constructor(private readonly aiService: AiService) {}

  getDemoReport(): Promise<DevOpsReport> {
    return this.aiService.enhanceReport(createDemoReport());
  }

  async getReportById(id: string): Promise<DevOpsReport> {
    if (demoReportIds.has(id)) {
      return await this.getDemoReport();
    }

    throw new NotFoundException(`Report '${id}' was not found.`);
  }

  async exportReport(id: string): Promise<string> {
    const report = await this.getReportById(id);

    return createReportMarkdown(report);
  }
}
