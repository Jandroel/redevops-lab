import { Controller, Get, Header, Inject, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { DevOpsReport } from "@redevops-lab/shared";
import { ReportsService } from "./reports.service.js";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reportsService: ReportsService) {}

  @Get("demo")
  @ApiOperation({ summary: "Return the built-in demo DevOps report." })
  @ApiResponse({ status: 200, description: "Demo report returned." })
  getDemoReport(): Promise<DevOpsReport> {
    return this.reportsService.getDemoReport();
  }

  @Get(":id")
  @ApiOperation({ summary: "Return a report by ID." })
  @ApiParam({ name: "id", example: "demo-jandroel-redevops-lab" })
  @ApiResponse({ status: 200, description: "Report returned." })
  @ApiResponse({ status: 404, description: "Report not found." })
  getReportById(@Param("id") id: string): Promise<DevOpsReport> {
    return this.reportsService.getReportById(id);
  }

  @Get(":id/export")
  @Header("Content-Type", "text/markdown; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="redevops-report.md"')
  @ApiOperation({ summary: "Export a report as Markdown." })
  @ApiParam({ name: "id", example: "demo-jandroel-redevops-lab" })
  @ApiProduces("text/markdown")
  @ApiResponse({ status: 200, description: "Markdown report returned." })
  @ApiResponse({ status: 404, description: "Report not found." })
  exportReport(@Param("id") id: string): Promise<string> {
    return this.reportsService.exportReport(id);
  }
}
