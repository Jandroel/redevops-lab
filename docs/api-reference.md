# API Reference

Base URL for local development:

```txt
http://localhost:3001/api
```

Swagger/OpenAPI:

```txt
http://localhost:3001/api/docs
```

## GET /health

Returns API status and runtime metadata.

```json
{
  "status": "ok",
  "service": "redevops-lab-api",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-07-03T00:00:00.000Z"
}
```

## POST /analyze

Validates a GitHub repository URL, calls GitHub for public repository metadata and tree data, and returns a `DevOpsReport`.

Request:

```json
{
  "url": "https://github.com/Jandroel/redevops-lab",
  "level": "beginner",
  "language": "es"
}
```

Accepted levels:

- `beginner`
- `intermediate`
- `advanced`

Accepted languages:

- `es`
- `en`

The endpoint uses:

```txt
GET https://api.github.com/repos/{owner}/{repo}
GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1
```

`GITHUB_TOKEN` is optional and only increases rate limits. Private repositories are not supported in this phase.

The report includes real repository metadata, filtered tree data, important files, detected stack, DevOps signals, initial findings, a rule-based DevOps Maturity Score, production-ready checklist, learning path, hands-on labs, recommended next steps, and an optional `ai` mentor section.

Response highlights:

```json
{
  "analysis": {},
  "score": {},
  "productionChecklist": [],
  "learningPath": [],
  "labs": [],
  "ai": {
    "enabled": false,
    "provider": "mock",
    "mode": "learning",
    "mentorSummary": "..."
  }
}
```

Expected error cases:

- `400`: invalid GitHub repository URL
- `403`: GitHub rate limit reached or access restricted
- `404`: repository not found or not public
- `409`: repository is empty
- `502`: GitHub network issue or unexpected response

## GET /reports/demo

Returns the built-in demo report for `Jandroel/redevops-lab`.

## GET /reports/:id

Returns the demo report for:

- `demo`
- `demo-jandroel-redevops-lab`

Returns `404` for other IDs until persistence is implemented.

## GET /reports/:id/export

Returns Markdown as text.

Headers:

```txt
Content-Type: text/markdown; charset=utf-8
Content-Disposition: attachment; filename="redevops-report.md"
```

## Error Shape

Errors use a consistent JSON shape:

```json
{
  "statusCode": 400,
  "message": "Invalid GitHub repository URL.",
  "error": "Bad Request",
  "path": "/api/analyze",
  "timestamp": "2026-07-03T00:00:00.000Z"
}
```

## Current Mock Boundaries

- No Prisma or PostgreSQL connection.
- AI mentor content is optional and disabled by default.
- No authentication.
- No private repository analysis.
- Score is rule-based, but it does not inspect deep file contents yet.
- Checklist, learning path, lab, and next-step generation are rule-based and do not depend on AI.
- AI mentor output is optional and does not change deterministic analyzer/scoring/learning output.
