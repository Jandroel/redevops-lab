import { Injectable } from "@nestjs/common";

export interface HealthResponse {
  status: "ok";
  service: "redevops-lab-api";
  version: "0.1.0";
  environment: string;
  timestamp: string;
}

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "redevops-lab-api",
      version: "0.1.0",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString()
    };
  }
}
