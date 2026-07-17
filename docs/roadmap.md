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
- Learning path based on real signals, findings, score gaps, stack, level, and language
- Practical hands-on labs by difficulty, category, suggested files, steps, validation, and estimated time
- Basic Spanish and English output for checklist, path, labs, and next steps
- Markdown export and frontend report sections updated for educational output

## Phase 6 - AI Integration

- Optional DevOps AI Mentor layer
- Mock provider by default, with OpenAI-compatible provider support
- Explain and personalize analyzer results without changing score or facts
- Ground all AI output in real detected findings
- Avoid invented files, tools, workflows, vulnerabilities, or practices

## Phase 7 - UI/UX Polish, Product Feel, and Deploy Readiness

- Professional landing page with analyzer CTA, product preview, trust copy, and feature grid
- `/analyze` UX with validation, example repositories, mentor mode selector, privacy copy, progress, and error states
- Report dashboard hierarchy for overview, score, actions, category scores, checklist, path, labs, AI mentor, signals, files, and export
- Score visual with rule-based evidence microcopy
- Improved checklist, learning path timeline, hands-on lab cards, and AI mentor panel
- Responsive polish for mobile, tablet, desktop, and large desktop
- Empty states for missing report/session data
- Deployment notes for Vercel frontend and Railway backend

## Phase 8 - Beginner Learning Experience

- Beginner learning journey generated from report evidence
- Practical glossary tied to the repository's current gaps and labs
- Richer hands-on labs with prerequisites, commands, expected outcomes, common mistakes, completion criteria, and verification checklist
- Local module progress in the report dashboard
- Markdown export updated with learning modules and glossary terms
- Beginner docs under `docs/learn/`

## Phase 9 - Persistence and Report Lifecycle

- Persist generated reports beyond session storage
- Introduce stable report IDs backed by storage
- Improve exported Markdown around persisted reports
- Add report lifecycle documentation

## Phase 10 - Persistence

- PostgreSQL
- Prisma
- Saved public reports by ID
- Report history without login initially

## Phase 11 - Portfolio Quality

- Tests
- Demo GIF and screenshots
- More documentation
- CONTRIBUTING guide
- Production Docker setup
