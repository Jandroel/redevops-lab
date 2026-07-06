import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { ReportsController } from "./reports.controller.js";
import { ReportsService } from "./reports.service.js";

@Module({
  imports: [AiModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
