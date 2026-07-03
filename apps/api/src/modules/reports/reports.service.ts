import { Injectable, NotFoundException } from "@nestjs/common";
import type { DevOpsReport } from "@redevops-lab/shared";
import { createDemoReport } from "./report.mock.js";
import { createReportMarkdown } from "./report-markdown.js";

const demoReportIds = new Set(["demo", "demo-jandroel-redevops-lab"]);

@Injectable()
export class ReportsService {
  getDemoReport(): DevOpsReport {
    return createDemoReport();
  }

  getReportById(id: string): DevOpsReport {
    if (demoReportIds.has(id)) {
      return this.getDemoReport();
    }

    throw new NotFoundException(`Report '${id}' was not found.`);
  }

  exportReport(id: string): string {
    const report = this.getReportById(id);

    return createReportMarkdown(report);
  }
}
