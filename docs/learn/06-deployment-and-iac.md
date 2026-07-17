# Deployment And Infrastructure As Code

Deployment is the process of releasing a version so users can use it. Infrastructure as Code defines infrastructure with versioned files.

## Deployment Runbook

A basic deployment runbook should answer:

- What branch or tag is deployed?
- Which checks must pass?
- Which environment variables are required?
- How do we verify the release?
- How do we roll back?

## Rollback

Rollback means returning to a known stable version. It should be documented before the first urgent incident.

## Infrastructure As Code

IaC tools such as Terraform let teams review infrastructure changes before applying them:

```bash
terraform fmt -check
terraform validate
terraform plan
```

## Common Mistakes

- Deploying from an unclear branch.
- No post-deploy verification.
- No rollback path.
- Applying infrastructure changes manually without a record.
