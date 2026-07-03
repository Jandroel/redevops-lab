import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service.js";
import type { HealthResponse } from "./health.service.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Return API health and runtime metadata." })
  @ApiResponse({ status: 200, description: "API is healthy." })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }
}
