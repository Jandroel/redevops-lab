# Scoring System

ReDevOps Lab calculates a deterministic DevOps Maturity Score from repository evidence. The score is educational and practical: it helps developers see which DevOps practices are visible in a public repository and what to improve next.

It is not a professional security audit, compliance certification, or production-readiness guarantee.

## Inputs

The scoring engine receives a `RepositoryAnalysis` from `packages/analyzer`.

It uses:

- repository metadata
- filtered repository tree
- important files
- DevOps signals
- detected stack
- bounded content checks for selected configuration and documentation files

It does not call GitHub directly and never runs repository code. When bounded content evidence exists, it prefers that evidence over filename inference.

## Categories And Weights

The global score totals 100 points.

| Category         | Weight |
| ---------------- | -----: |
| Containerization |     20 |
| CI/CD            |     20 |
| Configuration    |     15 |
| Security         |     15 |
| Observability    |     10 |
| Documentation    |     10 |
| Infrastructure   |     10 |

## Rules

Each rule returns:

- `points`
- `maxPoints`
- `passed`
- `evidence`
- `recommendation`
- optional `severity`

### Containerization - 20 pts

- Dockerfile detected: 5 pts
- `.dockerignore` detected: 3 pts
- Docker Compose detected: 4 pts
- Multi-stage Docker build confirmed: 3 pts
- Reproducible dependency install confirmed: 3 pts
- Docker health check confirmed: 2 pts

### CI/CD - 20 pts

- CI/CD pipeline detected: 6 pts
- Pull request trigger confirmed: 3 pts
- Automated test step confirmed: 3 pts
- Automated lint step confirmed: 2 pts
- Automated typecheck step confirmed: 2 pts
- Automated build step confirmed: 2 pts
- Deploy, release, or publish step confirmed: 2 pts

Workflow purpose is read from parsed triggers, jobs, step names, commands, and referenced actions. Filename inference is used only when evaluating an older report without `contentAnalysis`.

### Configuration - 15 pts

- `.env.example` or `.env.sample` detected: 4 pts
- safe empty or placeholder values confirmed: 3 pts
- Configuration documentation inferred: 3 pts
- `config/` directory detected: 2 pts
- Environment separation inferred: 3 pts

### Security - 15 pts

- Dependabot detected: 4 pts
- CodeQL detected: 3 pts
- security scanning path or workflow step detected: 3 pts
- `SECURITY.md` detected: 2 pts
- non-root or pinned container hardening confirmed: 3 pts

### Observability - 10 pts

- Health check signal detected: 3 pts
- Logging signal detected: 3 pts
- Metrics or Prometheus detected: 2 pts
- Grafana, OpenTelemetry, or OTEL detected: 2 pts

### Documentation - 10 pts

- `README.md`: 2 pts
- local setup instructions confirmed in README: 2 pts
- `docs/`: 2 pts
- deployment documentation: 2 pts
- `CONTRIBUTING.md`: 1 pt
- license metadata or license file: 1 pt

### Infrastructure - 10 pts

- Terraform or Pulumi detected: 4 pts
- Kubernetes manifests detected: 3 pts
- Helm chart detected: 2 pts
- serverless, infra, or deployment config detected: 1 pt

## Maturity Levels

| Percentage | Level            |
| ---------- | ---------------- |
| 0-24       | Initial          |
| 25-49      | Foundation       |
| 50-69      | Operational      |
| 70-84      | Production-Ready |
| 85-100     | Advanced         |

## Explainability

Every category includes the rules that passed and failed. For example:

```txt
Containerization: 12/20
+5 Dockerfile detected
+4 Docker Compose detected
+3 Multi-stage Docker build confirmed
+0 .dockerignore missing
+0 Reproducible dependency install missing
+0 Docker health check missing
```

The API also returns:

- strengths
- weaknesses
- next best actions

These are derived from rule results and category percentages, not from AI.

In Phase 5, `packages/learning` also uses score categories, rule evidence, failed rules, detected stack, and repository signals to generate the production-ready checklist, learning path, hands-on labs, and educational next steps.

## Current Limitations

- The score combines structure, filenames, known paths, and bounded content checks.
- General source code and runtime behavior are not inspected.
- It does not run tests, workflows, Dockerfiles, or deployment commands.
- It does not validate whether workflows or Dockerfiles actually work.
- It does not analyze private repositories.
- It does not use AI.
- It does not persist reports in a database.

## Future Improvements

Later phases can add richer source-language analyzers, historical trends, and AI explanations grounded in the deterministic score.
