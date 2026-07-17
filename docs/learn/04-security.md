# Security

Beginner DevOps security starts with reducing obvious and repeatable risks.

## First Practices

- Keep secrets out of Git.
- Add `.env.example` with fake values.
- Add dependency scanning.
- Add secret scanning.
- Document how to report a vulnerability.

## Dependency Scanning

Dependency scanning checks packages against known vulnerability databases. It does not prove the app is secure, but it catches common known problems early.

## Supply Chain Security

Supply chain security covers what enters your build:

- dependencies
- GitHub Actions
- container base images
- generated artifacts
- who can publish or deploy

## Common Mistakes

- Treating security as a final step.
- Adding scanners but never reviewing findings.
- Failing every scan without a triage policy.
- Storing provider tokens in frontend code.
