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

It does not call GitHub directly, does not run code, and does not inspect deep file contents yet.

## Categories And Weights

The global score totals 100 points.

| Category | Weight |
| --- | ---: |
| Containerization | 20 |
| CI/CD | 20 |
| Configuration | 15 |
| Security | 15 |
| Observability | 10 |
| Documentation | 10 |
| Infrastructure | 10 |

## Rules

Each rule returns:

- `points`
- `maxPoints`
- `passed`
- `evidence`
- `recommendation`
- optional `severity`

### Containerization - 20 pts

- Dockerfile detected: 8 pts
- `.dockerignore` detected: 5 pts
- Docker Compose detected: 5 pts
- Multiple container artifacts detected: 2 pts

### CI/CD - 20 pts

- CI/CD pipeline detected: 10 pts
- Test workflow probable: 4 pts
- Build workflow probable: 3 pts
- Deploy or release workflow probable: 3 pts

Workflow purpose is inferred from file names such as `ci.yml`, `test.yml`, `build.yml`, `deploy.yml`, `release.yml`, or `publish.yml`.

### Configuration - 15 pts

- `.env.example` or `.env.sample` detected: 6 pts
- Configuration documentation inferred: 3 pts
- `config/` directory detected: 3 pts
- Environment separation inferred: 3 pts

### Security - 15 pts

- Dependabot detected: 5 pts
- CodeQL detected: 4 pts
- Snyk, Trivy, Semgrep, or Gitleaks detected: 3 pts
- `SECURITY.md` detected: 3 pts

### Observability - 10 pts

- Health check signal detected: 3 pts
- Logging signal detected: 3 pts
- Metrics or Prometheus detected: 2 pts
- Grafana, OpenTelemetry, or OTEL detected: 2 pts

### Documentation - 10 pts

- `README.md`: 3 pts
- `docs/`: 2 pts
- deployment documentation: 2 pts
- `CONTRIBUTING.md`: 1 pt
- `CHANGELOG.md`: 1 pt
- license metadata or license file: 1 pt

### Infrastructure - 10 pts

- Terraform or Pulumi detected: 4 pts
- Kubernetes manifests detected: 3 pts
- Helm chart detected: 2 pts
- serverless, infra, or deployment config detected: 1 pt

## Maturity Levels

| Percentage | Level |
| --- | --- |
| 0-24 | Initial |
| 25-49 | Foundation |
| 50-69 | Operational |
| 70-84 | Production-Ready |
| 85-100 | Advanced |

## Explainability

Every category includes the rules that passed and failed. For example:

```txt
Containerization: 13/20
+8 Dockerfile detected
+5 Docker Compose detected
+0 .dockerignore missing
+0 Multiple container artifacts missing
```

The API also returns:

- strengths
- weaknesses
- next best actions

These are derived from rule results and category percentages, not from AI.

## Current Limitations

- The score is based mainly on structure, filenames, and known paths.
- It does not inspect deep file contents yet.
- It does not run tests, workflows, Dockerfiles, or deployment commands.
- It does not validate whether workflows or Dockerfiles actually work.
- It does not analyze private repositories.
- It does not use AI.
- It does not persist reports in a database.

## Future Improvements

Phase 5 will use score results to generate better learning paths and labs. Later phases can add content-aware analysis, richer package detection, historical trends, and AI explanations grounded in the deterministic score.
