import { Injectable } from "@nestjs/common";
import type { AiReportEnhancement } from "@redevops-lab/shared";
import { createDevOpsMentorMessages } from "../prompts/devops-mentor.prompt.js";
import type { AiEnhancementInput, AiProvider } from "./ai-provider.interface.js";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable()
export class OpenAICompatibleProvider implements AiProvider {
  readonly name = "openai-compatible";

  async enhanceReport(input: AiEnhancementInput): Promise<AiReportEnhancement> {
    const { config, mode } = input;

    if (!config.apiKey || !config.baseUrl || !config.model) {
      throw new Error("AI provider is not fully configured.");
    }

    const response = await fetch(chatCompletionsUrl(config.baseUrl), {
      method: "POST",
      signal: AbortSignal.timeout(config.timeoutMs),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: createDevOpsMentorMessages(input),
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`AI provider request failed with status ${response.status}.`);
    }

    const body = (await response.json()) as ChatCompletionResponse;
    const content = body.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI provider returned an empty response.");
    }

    return normalizeEnhancement(parseJsonObject(content), {
      enabled: true,
      provider: config.provider,
      model: config.model,
      mode
    });
  }
}

function chatCompletionsUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/$/, "");

  return normalized.endsWith("/chat/completions") ? normalized : `${normalized}/chat/completions`;
}

function parseJsonObject(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1)) as Record<string, unknown>;
    }

    throw new Error("AI provider did not return valid JSON.");
  }
}

function normalizeEnhancement(
  value: Record<string, unknown>,
  metadata: Pick<AiReportEnhancement, "enabled" | "provider" | "model" | "mode">
): AiReportEnhancement {
  return {
    ...metadata,
    generatedAt: new Date().toISOString(),
    mentorSummary: stringValue(value.mentorSummary),
    scoreInterpretation: stringValue(value.scoreInterpretation),
    recommendedFocus: stringValue(value.recommendedFocus),
    riskExplanation: stringValue(value.riskExplanation),
    mentorNotes: stringArray(value.mentorNotes),
    portfolioAdvice: stringArray(value.portfolioAdvice),
    interviewTalkingPoints: stringArray(value.interviewTalkingPoints),
    improvedNextSteps: stringArray(value.improvedNextSteps),
    learningAdvice: stringArray(value.learningAdvice)
  };
}

function stringValue(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "No AI content returned.";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 8);
}
