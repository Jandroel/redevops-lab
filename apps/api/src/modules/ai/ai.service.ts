import { Injectable } from "@nestjs/common";
import type { AiMentorMode, DevOpsReport } from "@redevops-lab/shared";
import { readAiConfig } from "./ai.config.js";
import { MockAiProvider } from "./providers/mock-ai.provider.js";
import { OpenAICompatibleProvider } from "./providers/openai-compatible.provider.js";

@Injectable()
export class AiService {
  constructor(
    private readonly mockProvider: MockAiProvider,
    private readonly openAiCompatibleProvider: OpenAICompatibleProvider
  ) {}

  async enhanceReport(report: DevOpsReport, mode?: AiMentorMode): Promise<DevOpsReport> {
    const config = readAiConfig();
    const selectedMode = mode ?? config.defaultMode;

    if (!config.enabled) {
      return {
        ...report,
        ai: await this.mockProvider.enhanceReport({
          report,
          mode: selectedMode,
          config,
          enabled: false
        })
      };
    }

    if (config.provider === "mock") {
      return {
        ...report,
        ai: await this.mockProvider.enhanceReport({
          report,
          mode: selectedMode,
          config,
          enabled: true
        })
      };
    }

    try {
      return {
        ...report,
        ai: await this.openAiCompatibleProvider.enhanceReport({
          report,
          mode: selectedMode,
          config,
          enabled: true
        })
      };
    } catch {
      return {
        ...report,
        ai: await this.mockProvider.enhanceReport({
          report,
          mode: selectedMode,
          config: {
            ...config,
            provider: "mock",
            model: undefined
          },
          enabled: false
        })
      };
    }
  }
}
