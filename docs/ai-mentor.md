# DevOps AI Mentor

The DevOps AI Mentor layer is an optional backend-only enhancement for ReDevOps Lab reports. It explains the deterministic report in a more educational style, helps prioritize next steps, and gives portfolio or interview guidance.

It does not replace the analyzer, scoring engine, or learning engine.

## What It Does

- explains the report in human-friendly language
- interprets the deterministic score
- recommends a focus area
- explains visible risks and missing signals
- creates mentor notes
- suggests portfolio improvements
- suggests interview talking points
- suggests learning advice

## What It Does Not Do

- change the score
- invent files, tools, workflows, deployment targets, vulnerabilities, or technologies
- claim something exists unless analyzer evidence supports it
- inspect full file contents
- execute actions
- write to GitHub
- create issues
- modify repositories
- persist history in a database

## Why It Is Optional

ReDevOps Lab must work without AI. The deterministic pipeline still generates:

- repository analysis
- DevOps score
- production-ready checklist
- learning path
- hands-on labs
- Markdown export

By default:

```txt
AI_ENABLED=false
AI_PROVIDER=mock
```

When AI is disabled, the API still returns `report.ai` with a disabled mock mentor summary so the frontend can render a stable section.

## Providers

### MockAiProvider

`MockAiProvider` does not call external APIs. It creates a deterministic mentor-style explanation from:

- score
- maturity level
- strengths
- weaknesses
- next best actions
- checklist
- learning path
- labs
- level
- language

It is the default provider and fallback if an external provider fails.

### OpenAICompatibleProvider

`OpenAICompatibleProvider` uses native `fetch` and a Chat Completions-compatible request shape. It is intended for providers such as OpenAI, DeepSeek, OpenRouter, Groq, and custom compatible endpoints.

It reads configuration only from backend environment variables. API keys are never exposed to the frontend.

## Environment Variables

```txt
AI_ENABLED=false
AI_PROVIDER=mock
AI_MODEL=
AI_API_KEY=
AI_BASE_URL=
AI_TEMPERATURE=0.3
AI_TIMEOUT_MS=20000
```

## DeepSeek Example

```txt
AI_ENABLED=true
AI_PROVIDER=deepseek
AI_MODEL=deepseek-v4-flash
AI_API_KEY=your_deepseek_api_key
AI_BASE_URL=https://api.deepseek.com
AI_TEMPERATURE=0.3
```

## OpenAI-compatible Example

```txt
AI_ENABLED=true
AI_PROVIDER=openai
AI_MODEL=your-model
AI_API_KEY=your_api_key
AI_BASE_URL=https://api.openai.com/v1
AI_TEMPERATURE=0.3
```

## Safety

The prompt tells the provider to use only facts included in the compact JSON input. The backend sends a compact report summary, not full repository trees or file contents.

If a provider call fails, the analysis request still succeeds and falls back to `MockAiProvider`.

## Current Limitations

- no streaming
- no browser UI for configuring keys
- no usage or cost dashboard
- no persistence
- no autonomous agents
- no GitHub issue creation
- no repository modification

Future phases can add deeper prompt controls, model selection UI, usage tracking, saved report history, and provider-specific diagnostics.
