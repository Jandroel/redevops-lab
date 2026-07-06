import type { AiMentorMode, AiProviderName } from "@redevops-lab/shared";

export interface AiConfig {
  enabled: boolean;
  provider: AiProviderName;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  timeoutMs: number;
  defaultMode: AiMentorMode;
}

const providerNames = new Set<AiProviderName>(["mock", "openai", "deepseek", "openrouter", "groq", "custom"]);
const mentorModes = new Set<AiMentorMode>(["learning", "interview", "production", "portfolio", "open-source"]);

export function readAiConfig(): AiConfig {
  const provider = normalizeProvider(process.env.AI_PROVIDER);
  const defaultMode = normalizeMode(process.env.AI_MENTOR_MODE);

  return {
    enabled: process.env.AI_ENABLED?.toLowerCase() === "true",
    provider,
    model: blankToUndefined(process.env.AI_MODEL),
    apiKey: blankToUndefined(process.env.AI_API_KEY),
    baseUrl: blankToUndefined(process.env.AI_BASE_URL),
    temperature: parseNumber(process.env.AI_TEMPERATURE, 0.3),
    timeoutMs: parseInteger(process.env.AI_TIMEOUT_MS, 20_000),
    defaultMode
  };
}

function normalizeProvider(value: string | undefined): AiProviderName {
  if (!value) {
    return "mock";
  }

  const normalized = value.toLowerCase() as AiProviderName;

  return providerNames.has(normalized) ? normalized : "custom";
}

function normalizeMode(value: string | undefined): AiMentorMode {
  if (!value) {
    return "learning";
  }

  const normalized = value.toLowerCase() as AiMentorMode;

  return mentorModes.has(normalized) ? normalized : "learning";
}

function blankToUndefined(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
