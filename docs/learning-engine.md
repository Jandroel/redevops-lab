# Learning Engine

`packages/learning` turns repository analysis and scoring evidence into educational output. It is deterministic and rule-based; there is no AI, database, repository cloning, GitHub issue creation, or repository writing in this phase.

## Inputs

The engine receives:

- `RepositoryAnalysis` from `packages/analyzer`
- `DevOpsScoreSummary` from `packages/scoring`
- `level`: `beginner`, `intermediate`, or `advanced`
- `language`: `es` or `en`

It uses visible repository signals, important files, detected stack, scoring rule evidence, and missing rule evidence.

## Production-ready Checklist

`generateProductionChecklist` returns 10 to 18 items. Items cover configuration, containerization, CI/CD, security, observability, documentation, and infrastructure.

Each item includes:

- `status`: `done`, `missing`, or `recommended`
- `priority`: `low`, `medium`, or `high`
- `category`
- `evidence`

Missing items avoid absolute claims. For example, they use wording like `No signal detected` rather than claiming the project has no implementation.

## Learning Path

`generateLearningPath` returns 5 to 8 ordered steps. It prioritizes missing and recommended checklist items, then fills mature repositories with more advanced improvement steps.

The path adapts to level:

- `beginner`: explains why the practice matters and recommends a minimum useful version
- `intermediate`: focuses on applying the practice to the current workflow
- `advanced`: frames the work as team-ready standardization and automation

## Hands-on Labs

`generateHandsOnLabs` returns 4 to 8 labs. Labs are selected from checklist gaps, learning path references, score maturity, and detected stack.

Each lab includes:

- title
- difficulty
- objective
- why it matters
- suggested files
- steps
- validation
- estimated time
- category

Suggested files are marked as suggested when they were not detected in the repository tree. The engine does not generate files or modify repositories.

## Language

The engine includes a small `localization.ts` helper for Spanish and English strings. Technical names such as Docker, CI/CD, Terraform, Kubernetes, Prometheus, and GitHub Actions stay in English.

This is intentionally not a full i18n framework yet.

## Current Limitations

- File content is not deeply inspected.
- Workflow purpose is inferred from file paths and names.
- Security and observability checks are signals, not audits.
- Private repositories are not supported.
- There is no persistence.
- There is no AI explanation layer yet.
