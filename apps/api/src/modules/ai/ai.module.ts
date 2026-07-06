import { Module } from "@nestjs/common";
import { AiService } from "./ai.service.js";
import { MockAiProvider } from "./providers/mock-ai.provider.js";
import { OpenAICompatibleProvider } from "./providers/openai-compatible.provider.js";

@Module({
  providers: [AiService, MockAiProvider, OpenAICompatibleProvider],
  exports: [AiService]
})
export class AiModule {}
