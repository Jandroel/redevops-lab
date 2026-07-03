# Architecture

ReDevOps Lab is organized as a pnpm monorepo so the web app, API, and domain packages can evolve together without mixing responsibilities.

## Workspaces

- `apps/web`: Next.js application that owns the product interface, marketing landing, analyze form, and visual reports.
- `apps/api`: NestJS API that will expose health, analyze, and report endpoints.
- `packages/shared`: Shared TypeScript contracts used by apps and domain packages.
- `packages/analyzer`: Future GitHub repository analyzer. It will validate URLs, read repository trees, and detect stack and DevOps files.
- `packages/scoring`: Rule-based scoring engine. It turns analyzer evidence into a DevOps maturity score, category breakdown, rule evidence, strengths, weaknesses, and next best actions.

## Data Flow

Phase 3 routes the analyzer form from `apps/web` to `apps/api`. The backend validates the request, calls GitHub for public repository metadata and the recursive tree, runs deterministic detectors, and returns a typed `DevOpsReport`. Future phases will replace the mock score with rule-based scoring before any AI explanation layer is added.

```txt
User GitHub URL
  -> apps/web
  -> apps/api
  -> DTO validation
  -> GitHub REST API
  -> packages/analyzer
  -> packages/scoring
  -> report response
```

## Backend Modules

- `HealthModule`: runtime health and service metadata.
- `AnalyzeModule`: validates repository input and returns a report based on real public GitHub tree data.
- `GitHubModule`: reads optional `GITHUB_TOKEN` and delegates public repository analysis.
- `ReportsModule`: serves demo reports, report lookup, and Markdown export.
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

## Deployment

- `apps/web` is intended for Vercel with root directory `apps/web`.
- `apps/api` is intended for Railway with root directory `apps/api`.
- PostgreSQL will be introduced later, likely on Railway, and accessed through Prisma.

## Design Direction

The UI should feel like a serious developer tool: dark by default, technical, scannable, and focused on practical DevOps learning outcomes rather than generic AI chat patterns.
