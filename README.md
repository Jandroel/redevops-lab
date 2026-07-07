# ReDevOps Lab

**Turn any GitHub repository into a DevOps learning lab.**

ReDevOps Lab analyzes a public GitHub repository and turns it into a personalized DevOps learning lab with a rule-based maturity score, production-readiness checklist, detected stack, missing practices, and hands-on labs.

The project is in active development. The current implementation covers the foundation through Phase 7: monorepo, web experience, NestJS API, OpenAPI docs, GitHub repository analyzer, rule-based scoring engine, rule-based learning engine, optional AI mentor layer, UI/UX polish, examples, documentation, CI, and deploy-ready structure.

## Features

- Rule-based DevOps maturity score
- Rule-based production-ready checklist
- Public GitHub repository analyzer
- Basic stack detection from repository files
- DevOps signal detection for Docker, CI/CD, security, docs, observability, and infrastructure
- Personalized learning path generated from score gaps and repository signals
- Hands-on lab cards with objectives, steps, validation, difficulty, estimated time, and suggested files
- Optional DevOps AI Mentor layer with mock and OpenAI-compatible providers
- Product-grade report dashboard with score, evidence, checklist, learning path, labs, mentor notes, and Markdown export
- Analyzer UX with validation, example repositories, loading progress, and actionable error states
- Markdown export with checklist, learning path, labs, and scoring evidence
- Basic Spanish and English report content for educational sections
- Next.js frontend with dark cloud-native UI
- NestJS API with health, analyze, reports, and Markdown export endpoints
- Swagger/OpenAPI documentation at `/api/docs`
- Frontend analyzer form connected to the API

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Internal packages: shared contracts, analyzer, scoring, learning
- Future database: PostgreSQL
- Future ORM: Prisma
- Deployment target: Vercel for `apps/web`, Railway for `apps/api`

## Project Structure

```txt
redevops-lab/
  apps/
    web/        # Next.js app
    api/        # NestJS API
  packages/
    shared/     # Shared TypeScript contracts
    analyzer/   # GitHub repository analyzer
    scoring/    # Rule-based DevOps scoring engine
    learning/   # Rule-based checklist, learning path, labs, and next steps
  docs/         # Architecture, API, analyzer, scoring, learning, UI, roadmap, deployment
  examples/     # Example reports
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open the web app at `http://localhost:3000`.

The API runs at `http://localhost:3001/api`.

Swagger docs are available at `http://localhost:3001/api/docs`.

## Scripts

```bash
pnpm dev          # Run web and API in parallel
pnpm dev:web      # Run only the Next.js app
pnpm dev:api      # Run only the NestJS API
pnpm lint         # Lint all workspaces
pnpm typecheck    # Typecheck all workspaces
pnpm test         # Build packages and run Node.js domain tests
pnpm build        # Build all workspaces
pnpm build:packages # Build shared, analyzer, scoring, and learning packages
pnpm format       # Format the repository
```

## API Endpoints

```txt
GET  /api/health
POST /api/analyze
GET  /api/reports/demo
GET  /api/reports/:id
GET  /api/reports/:id/export
GET  /api/docs
```

`POST /api/analyze` validates a GitHub repository URL, calls the GitHub REST API for public repository metadata and recursive file tree data, then returns a `DevOpsReport` with detected stack, DevOps signals, important files, findings, rule-based DevOps Maturity Score, production-ready checklist, learning path, hands-on labs, and recommended next steps.

## Environment

Copy `.env.example` to `.env.local` for local development when needed.

```txt
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
DATABASE_URL=postgresql://user:password@localhost:5432/redevops_lab
GITHUB_TOKEN=
# Network proxy - optional
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,127.0.0.1
# AI - optional
AI_ENABLED=false
AI_PROVIDER=mock
AI_MODEL=
AI_API_KEY=
AI_BASE_URL=
AI_MENTOR_MODE=learning
AI_TEMPERATURE=0.3
AI_TIMEOUT_MS=20000
```

`GITHUB_TOKEN` is optional and only increases GitHub API rate limits for public repository analysis. If your network blocks direct Node.js HTTPS requests, set `HTTPS_PROXY` and `HTTP_PROXY` before starting `pnpm dev:api` or place them in the local API environment file. AI is disabled by default, mock mode is safe for demos, and provider keys are used only in the backend. Do not commit real secrets.

## Project Status

ReDevOps Lab is under active development and ready for public GitHub iteration. Core analysis, scoring, checklist, learning path, and labs are deterministic and evidence-based. The AI mentor layer is optional and may explain or prioritize the report, but it does not change analyzer facts, score, findings, checklist, learning path, or labs. There is no database, login, private repository support, or real deployment automation yet.

## Roadmap

1. Foundation monorepo and first visual experience
2. Backend contracts and API modules
3. GitHub repository analyzer
4. Rule-based DevOps scoring engine
5. Rule-based learning path, hands-on labs, production checklist, and bilingual educational output
6. Optional AI mentor explanations grounded in analyzer output
7. UI/UX polish, report dashboard organization, examples, loading/error/empty states, and deploy readiness notes
8. Persisted reports and export polish
9. PostgreSQL persistence
10. Portfolio-grade tests, screenshots, CONTRIBUTING guide, and production deployment assets

## Deployment Plan

- Frontend: Vercel with project root `apps/web`
- Backend: Railway with project root `apps/api`
- Database: Railway PostgreSQL in a later phase
- Required deploy variables: `NEXT_PUBLIC_API_URL` for web and `CORS_ORIGIN`, `PORT`, optional `GITHUB_TOKEN`, optional AI variables for API

## Current Mock Boundaries

- No database or Prisma connection yet
- AI mentor is optional, disabled by default, and does not replace deterministic analysis
- No private repository analysis yet
- Score is deterministic and rule-based, but still limited to repository structure and file-name evidence
- Learning path, lab, checklist, and next-step generation are deterministic and rule-based; they do not inspect deep file contents yet

## Author

Built by **Jandroel**.

Repository: [github.com/Jandroel/redevops-lab](https://github.com/Jandroel/redevops-lab)
