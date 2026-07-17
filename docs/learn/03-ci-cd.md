# CI/CD

CI/CD automates validation and delivery.

## CI

Continuous Integration validates changes before they are merged. A basic CI pipeline can run:

- install dependencies
- lint
- typecheck
- tests
- build

## CD

Continuous Delivery or Deployment prepares or ships a version after checks pass. ReDevOps Lab currently focuses on repository evidence and does not deploy automatically.

## Quality Gates

A quality gate is a condition that must pass before a change moves forward:

```txt
pull request -> CI passes -> review -> merge
```

## Common Mistakes

- A workflow that runs but does not validate meaningful commands.
- CI commands that are different from local commands.
- Ignoring failed checks because they are flaky.
- Deploying without rollback notes.
