# DevOps Basics

DevOps is a feedback loop for building and operating software. It connects code, validation, release, observation, and learning.

## The Loop

```txt
Code change
  -> automated checks
  -> review
  -> deploy
  -> observe
  -> improve the next change
```

## What ReDevOps Lab Looks For

ReDevOps Lab reads visible repository evidence:

- `README.md` for setup and usage
- `.env.example` for runtime configuration
- `Dockerfile` and `docker-compose.yml` for containers
- `.github/workflows/*.yml` for CI/CD
- `docs/` for runbooks, deployment notes, and architecture
- security, observability, and infrastructure files

It does not assume a practice exists unless the repository leaves a signal.

## Beginner Rule

Do not try to add every DevOps practice in one commit. Pick the highest-priority missing signal, do one lab, validate it, and re-analyze.
