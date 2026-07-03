# GitHub Repository Analyzer

Phase 3 introduces the first real analyzer for public GitHub repositories.

## Flow

1. Parse and validate a GitHub repository URL.
2. Fetch repository metadata from GitHub.
3. Fetch the recursive Git tree for the default branch.
4. Filter irrelevant paths and heavy assets.
5. Detect stack items from file names.
6. Detect DevOps signals from file names and known paths.
7. Generate initial findings from real detected signals.
8. Return a `DevOpsReport` compatible with the frontend.

## GitHub Endpoints

```txt
GET https://api.github.com/repos/{owner}/{repo}
GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1
```

Headers:

```txt
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
User-Agent: redevops-lab
Authorization: Bearer <GITHUB_TOKEN>
```

`Authorization` is only sent when `GITHUB_TOKEN` exists.

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
- No source-code content analysis yet.
- No private repository support.
- No semantic package.json parsing yet.
- Numeric scoring is handled by `packages/scoring` using analyzer output.

## Manual Test Repositories

```txt
https://github.com/Jandroel/redevops-lab
https://github.com/vercel/next.js
https://github.com/nestjs/nest
https://github.com/docker/awesome-compose
```
