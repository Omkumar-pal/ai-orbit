# AIOrbit Backend — Postgres + Prisma (port 3001)

Manual pipeline: `workers.dev` → `backend/data/*.json` → Postgres via Prisma upsert incremental → `backend` API → `frontend` (3000).

## Quick start

```bash
cd backend
docker compose up -d          # Postgres aiorbit:aiorbit @ 5432
npm install
npx prisma generate
npx prisma migrate dev --name init

# 1) Download all resources (paginated, pageSize 100)
npm run download              # → backend/data/{tools.json:1510, tasks.json:115, ...}
# or single: npm run download:tools

# 2) Seed (upsert incremental — preserves manual edits)
npm run seed                  # upsert
npm run seed:clean            # truncate then seed

# 3) Run Next backend (port 3001) — mirrors workers.dev shape
npm run dev                   # http://localhost:3001/api/v1/tools?category=image-generation

# 4) Frontend points to backend
# frontend/.env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Frontend wiring (full data first, filters later)

* `backend/src/app/api/v1/tools/route.ts` → `prisma.tool.findMany({skip,take,include})` + `count` → `{tools,total,page,pageSize,totalPages}`
* `frontend/src/lib/api/client.ts` → `BASE = process.env.NEXT_PUBLIC_BACKEND_URL`
* `Creativity/Personal` = views on `ToolCategory` (no separate tables) per `aiorbit_schema.sql:192/200`.

## Endpoints

`GET /api/v1/tools?page&PageSize&q&category&pricing&sort` → joins `tool_tags/tool_use_cases/tool_categories`
