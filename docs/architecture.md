# Architecture

ReDevOps Lab is organized as a pnpm monorepo so the web app, API, and domain packages can evolve together without mixing responsibilities.

## Workspaces

- `apps/web`: Next.js application that owns the product interface, marketing landing, analyze form, and visual reports.
- `apps/api`: NestJS API that will expose health, analyze, and report endpoints.
- `packages/shared`: Shared TypeScript contracts used by apps and domain packages.
- `packages/analyzer`: GitHub repository analyzer. It validates URLs, reads repository trees, and detects stack and DevOps files.
- `packages/scoring`: Rule-based scoring engine. It turns analyzer evidence into a DevOps maturity score, category breakdown, rule evidence, strengths, weaknesses, and next best actions.
- `packages/learning`: Rule-based learning engine. It turns analysis and score gaps into a production-ready checklist, learning path, hands-on labs, and educational next steps.

## Data Flow

The analyzer form routes from `apps/web` to `apps/api`. The backend validates the request, calls GitHub for public repository metadata and the recursive tree, runs deterministic detectors, calculates a rule-based score, and generates educational guidance before returning a typed `DevOpsReport`.

```txt
User GitHub URL
  -> apps/web
  -> apps/api
  -> DTO validation
  -> GitHub REST API
  -> packages/analyzer
  -> packages/scoring
  -> packages/learning
  -> report response
```

## Backend Modules

- `HealthModule`: runtime health and service metadata.
- `AnalyzeModule`: validates repository input and returns a report based on real public GitHub tree data.
- `GitHubModule`: reads optional `GITHUB_TOKEN` and delegates public repository analysis.
- `ReportsModule`: serves demo reports, report lookup, and Markdown export.
- `AiModule`: optional mentor layer that enriches reports without changing deterministic analysis output.
- `ConfigModule`: reads environment configuration for local and deployed environments.

The API also configures Helmet, CORS, request validation, Swagger/OpenAPI, a global error filter, and a basic rate limit.

## Analyzer Package

`packages/analyzer` owns reusable logic for:

- parsing GitHub repository URLs
- fetching GitHub metadata and recursive trees
- filtering irrelevant repository paths
- detecting stack signals by file names
- detecting DevOps signals
- generating initial findings

## Learning Package

`packages/learning` owns reusable logic for:

- generating 10 to 18 production-readiness checklist items from signals and score rules
- generating 5 to 8 learning path steps based on missing or recommended practices
- generating 4 to 8 hands-on labs with objective, rationale, steps, validation, difficulty, estimated time, and suggested files
- adapting educational copy to `level` (`beginner`, `intermediate`, `advanced`)
- emitting basic Spanish or English content through `language` (`es`, `en`)

The learning engine is deterministic. It does not use AI, read file contents deeply, clone repositories, write to repositories, create GitHub issues, or persist data.

## AI Mentor Module

`apps/api/src/modules/ai` owns the optional AI mentor layer.

The API flow is:

```txt
AnalyzeService
  -> analyzer
  -> scoring
  -> learning
  -> AiService
  -> selected provider
  -> report.ai
```

`AiService` selects a provider from environment configuration. `MockAiProvider` is the safe fallback and default path. `OpenAICompatibleProvider` uses backend-only `fetch` calls against Chat Completions-compatible providers when `AI_ENABLED=true` and the provider is configured.

The AI layer may explain, summarize, and prioritize. It must not change `analysis`, `score`, `findings`, `productionChecklist`, `learningPath`, or `labs`.

## Deployment

- `apps/web` is intended for Vercel with root directory `apps/web`.
- `apps/api` is intended for Railway with root directory `apps/api`.
- PostgreSQL will be introduced later, likely on Railway, and accessed through Prisma.

## Design Direction

The UI should feel like a serious developer tool: dark by default, technical, scannable, and focused on practical DevOps learning outcomes rather than generic AI chat patterns.
