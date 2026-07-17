# Learning Engine

`packages/learning` turns repository analysis and scoring evidence into educational output. It is deterministic and rule-based; it does not call AI, use a database, clone repositories, create GitHub issues, or write to repositories.

The current engine generates six connected layers:

1. Production-ready checklist
2. Ordered learning path
3. Hands-on labs
4. Beginner concepts and glossary terms
5. Guided learning modules that connect concepts, labs, checklist evidence, and outcomes
6. Prioritized guided missions with evidence confidence, small steps, and knowledge checks

## Inputs

The engine receives:

- `RepositoryAnalysis` from `packages/analyzer`
- `DevOpsScoreSummary` from `packages/scoring`
- `level`: `beginner`, `intermediate`, or `advanced`
- `language`: `es` or `en`

It uses visible repository signals, important files, detected stack, bounded content checks, scoring rule evidence, and missing rule evidence.

## Production-ready Checklist

`generateProductionChecklist` returns up to 20 items. Items cover configuration, containerization, CI/CD, security, observability, documentation, and infrastructure. Content-backed items can distinguish a present file from a practice confirmed inside it, such as CI test steps or safe environment placeholders.

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
- concept IDs
- prerequisites
- suggested files
- steps
- suggested commands
- expected outcome
- common mistakes
- completion criteria
- verification checklist
- validation
- estimated time
- category

Suggested files are marked as suggested when they were not detected in the repository tree. The engine does not generate files or modify repositories.

## Concepts and Glossary

`generateDevOpsConcepts` builds a practical glossary for the report. It starts with the core DevOps feedback loop and repository evidence model, then adds concepts based on:

- lab concept IDs
- learning path topics
- missing or high-priority checklist categories

Concepts explain terms in beginner-friendly language and include:

- term
- category
- short definition
- plain-language explanation
- why it matters
- practical example
- related terms

Examples include environment variables, secret hygiene, Dockerfile, container image, CI pipeline, quality gate, dependency scanning, health check, logging, metrics, runbook, rollback, Infrastructure as Code, and Kubernetes.

## Guided Learning Modules

`generateLearningModules` groups report output into beginner-friendly modules. Modules are not a separate scoring system; they are a teaching layer over deterministic report evidence.

Each module includes:

- title
- category
- summary
- beginner goal
- why the module matters now for this repository
- related concept IDs
- related lab IDs
- related checklist IDs
- estimated time
- expected outcome

The frontend uses these modules for the interactive learning journey. Progress is stored locally in the browser because ReDevOps Lab has no database yet.

## Guided Missions

`generateGuidedLearningMissions` ranks actionable modules from checklist status and priority, then selects up to four missions for a beginner report. Intermediate and advanced reports may include one or two additional missions.

Each mission includes:

- a plain-language goal and repository-specific reason for learning it now
- an evidence level: `confirmed`, `inferred`, or `needs-review`
- the checklist evidence and visible files behind that conclusion
- prerequisites, suggested files, commands, and small practice steps
- expected outcome and completion criteria
- a short deterministic knowledge check with explanatory feedback

`inferred` is used when a visible signal was not found. This wording is intentional: a missing path does not prove that a practice is absent. `needs-review` is used when the repository tree is partial, analyzer warnings exist, or file structure alone cannot support a reliable conclusion.

The frontend stores completed missions, checked steps, and knowledge-check answers in local browser storage. It does not claim that a repository change was executed or verified automatically.

## Language

The engine includes a small `localization.ts` helper for Spanish and English strings. Technical names such as Docker, CI/CD, Terraform, Kubernetes, Prometheus, and GitHub Actions stay in English.

This is intentionally not a full i18n framework yet.

## Current Limitations

- Only a bounded allowlist of high-value configuration and documentation files is inspected by the analyzer.
- Workflow purpose uses parsed triggers, job names, steps, commands, and actions when workflow content is available; filename inference remains only as a compatibility fallback for older reports.
- Security and observability checks are signals, not audits.
- Private repositories are not supported.
- There is no persistence.
- Guided mission progress and learning module progress are local-only in the browser.
- The optional AI mentor layer lives outside this package and may explain the report, but it does not change learning engine output.
