# GitHub Repository Analyzer

Phase 3 introduces the first real analyzer for public GitHub repositories.

## Flow

1. Parse and validate a GitHub repository URL.
2. Fetch repository metadata from GitHub.
3. Fetch the recursive Git tree for the default branch.
4. Filter irrelevant paths and heavy assets.
5. Select an allowlist of high-value text files within strict file and byte limits.
6. Fetch selected public content from `raw.githubusercontent.com`.
7. Parse `package.json`, GitHub Actions, Compose, Dockerfile, README, and env examples.
8. Detect stack items and broad DevOps signals from known paths.
9. Generate content-backed checks and initial findings.
10. Pass analyzer output to `packages/scoring` and `packages/learning`.
11. Return a `DevOpsReport` compatible with the frontend.

## GitHub Endpoints

```txt
GET https://api.github.com/repos/{owner}/{repo}
GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{selected-path}
```

Headers:

```txt
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
User-Agent: redevops-lab
Authorization: Bearer <GITHUB_TOKEN>
```

`Authorization` is only sent when `GITHUB_TOKEN` exists.

The token is sent only to `api.github.com`. Content requests to `raw.githubusercontent.com` do not include it.

## Bounded Content Analysis

The analyzer selects only these file kinds:

- root and workspace `package.json` files
- `.github/workflows/*.yml` and `.yaml`
- Dockerfiles
- Compose files
- one high-priority `README.md`
- `.env.example` and `.env.sample`

Default limits are 10 files, 96 KB per file, and 480 KB total. Per-kind caps prevent a large monorepo from spending the whole budget on one file type. Invalid paths, binary-looking content, oversized files, timeouts, and unavailable files are skipped with an explicit warning instead of failing the full repository analysis.

The YAML parser uses unique-key validation and a bounded alias expansion when converting documents. Dockerfiles are inspected as directives and continuation lines; no build is executed.

Raw file content is never included in `RepositoryContentAnalysis`. For environment examples, only variable names and safe status messages are reported; values are never returned.

## URL Support

Accepted examples:

```txt
https://github.com/owner/repo
http://github.com/owner/repo
github.com/owner/repo
https://www.github.com/owner/repo
https://github.com/owner/repo/
https://github.com/owner/repo.git
```

Rejected examples:

```txt
https://gitlab.com/owner/repo
https://github.com/owner
https://github.com
texto cualquiera
https://github.com/owner/repo/issues
```

## Detectors

The analyzer currently detects:

- JavaScript, TypeScript, Next.js, Vite, NestJS, Tailwind CSS
- Python, Django, FastAPI
- Go, Java, .NET, Rust, PHP, Laravel
- Prisma, Drizzle, TypeORM
- Docker, GitHub Actions, Terraform, Kubernetes, Helm, Prometheus, Grafana
- DevOps signals for containerization, CI/CD, configuration, security, observability, infrastructure, deployment, and documentation

## Tree Filtering

Ignored paths include:

```txt
.git/
node_modules/
dist/
build/
coverage/
.next/
.nuxt/
.cache/
vendor/
target/
bin/
obj/
.idea/
.vscode/
```

Large binary/media extensions and minified assets are skipped. Important files such as `README.md`, `package.json`, lockfiles, Docker files, GitHub workflows, `.env.example`, Prisma schema, Terraform, Kubernetes, Helm, Prometheus, and docs are preserved.

The analyzer processes up to 5000 relevant tree items. If the tree is truncated, the report includes a warning and finding.

## Limitations

- Public repositories only.
- No local clone.
- No general source-code or semantic application analysis.
- No private repository support.
- Content checks do not execute package scripts, workflows, Docker builds, or Compose services.
- A passed check confirms visible configuration text, not successful runtime behavior.
- Numeric scoring is handled by `packages/scoring` using analyzer output.
- Checklist, learning path, and labs are handled by `packages/learning` using analyzer and scoring output.

## Manual Test Repositories

```txt
https://github.com/Jandroel/redevops-lab
https://github.com/vercel/next.js
https://github.com/nestjs/nest
https://github.com/docker/awesome-compose
```
