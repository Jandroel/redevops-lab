# Deployment

Phase 1 prepares the repository for a split deployment model.

## Frontend - Vercel

- Project root: `apps/web`
- Build command: `pnpm build`
- Development command: `pnpm dev:web`
- Main environment variable: `NEXT_PUBLIC_API_URL`

The frontend should call the public API URL once the backend is deployed.

## Backend - Railway

- Project root: `apps/api`
- Build command: `pnpm build`
- Start command: `pnpm start`
- Default port variable: `PORT`
- CORS variable: `CORS_ORIGIN`

The API currently exposes:

```txt
GET  /api/health
POST /api/analyze
GET  /api/reports/demo
GET  /api/reports/:id
GET  /api/reports/:id/export
GET  /api/docs
```

Set `CORS_ORIGIN` to the deployed Vercel URL when deploying the API.

## Database - Future

PostgreSQL is not used in Phase 2. A local Docker Compose service is included so Prisma and persistence can be introduced later without changing the repository shape.

Planned local URL:

```txt
postgresql://redevops:redevops@localhost:5432/redevops_lab
```
