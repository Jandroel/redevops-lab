# Roadmap

## Phase 1 - Foundation and First Visual Experience

- Monorepo with pnpm workspaces
- Next.js frontend
- NestJS API with health endpoint
- Internal packages
- Initial docs, CI, env examples, and Docker Compose

## Phase 2 - Backend Base and Contracts

- Health, Analyze, and Reports modules
- DTO validation
- Swagger/OpenAPI
- Configuration, CORS, Helmet, global pipes, and basic rate limiting
- Frontend connection to `POST /api/analyze`
- Report API fallback behavior in the frontend

## Phase 3 - GitHub Repository Analyzer

- Validate GitHub URLs
- Extract owner and repo
- Read public repository metadata and recursive file trees from GitHub
- Ignore irrelevant folders and heavy files
- Detect stack and DevOps files
- Generate initial findings from real repository signals

## Phase 4 - DevOps Scoring Engine

- Rule-based scoring by category
- Evidence per scoring rule
- Maturity levels
- Strengths, weaknesses, and next best actions
- Deterministic scoring before AI explanation

## Phase 5 - Learning Path and Labs

- Production-readiness checklist
- Practical labs by difficulty
- Spanish and English output

## Phase 6 - AI Integration

- Explain and personalize analyzer results
- Ground all AI output in real detected findings
- Avoid invented files or practices

## Phase 7 - Complete Report Page

- Score ring
- Category bars
- Repo tree
- Checklist
- Labs
- Risk badges

## Phase 8 - Markdown Export

- Generate `redevops-report.md`
- Include diagnosis, score, path, labs, and next steps

## Phase 9 - Persistence

- PostgreSQL
- Prisma
- Saved public reports by ID
- Report history without login initially

## Phase 10 - Portfolio Quality

- Tests
- Demo GIF and screenshots
- More documentation
- CONTRIBUTING guide
- Production Docker setup
