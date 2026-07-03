import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AnalyzeModule } from "./modules/analyze/analyze.module.js";
import { Module } from "@nestjs/common";
import { GitHubModule } from "./modules/github/github.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { ReportsModule } from "./modules/reports/reports.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env", "../../.env.local", "../../.env"]
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60
      }
    ]),
    GitHubModule,
    HealthModule,
    AnalyzeModule,
    ReportsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
