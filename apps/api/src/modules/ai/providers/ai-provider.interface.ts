import type { AiMentorMode, AiReportEnhancement, DevOpsReport } from "@redevops-lab/shared";
import type { AiConfig } from "../ai.config.js";

export interface AiEnhancementInput {
  report: DevOpsReport;
  mode: AiMentorMode;
  config: AiConfig;
  enabled: boolean;
}

export interface AiProvider {
  readonly name: string;
  enhanceReport(input: AiEnhancementInput): Promise<AiReportEnhancement>;
}
