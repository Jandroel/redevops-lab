# Runtime Configuration

Runtime configuration is the set of values an app needs when it runs: ports, URLs, feature flags, credentials, provider names, and API base URLs.

## Why It Matters

The same code should run in different environments with different settings:

- local development
- CI
- staging
- production

Configuration should change without editing source code.

## Good First Practice

Create `.env.example` with fake values:

```txt
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
GITHUB_TOKEN=
AI_ENABLED=false
AI_API_KEY=
```

Then document how to copy it:

```bash
cp .env.example .env.local
```

## Common Mistakes

- Committing real API keys.
- Documenting variable names but not what they do.
- Assuming frontend and backend variables are loaded the same way.
- Forgetting proxy variables on restricted networks.
