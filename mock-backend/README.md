# mock-backend — isolated Postgres + Prisma (port 5433, optional API 3002)

Isolated from `backend` (5432/aiorbit). `mock_aiorbit` on `5433` — DirectoryItem heap (8KB pages, MVCC, WAL, shared_buffers) via Prisma.

## Quick start
```bash
cd mock-backend
docker compose up -d          # mock-aiorbit-db @ 5433
npm install
npx prisma generate --schema=schema/schema.prisma
npx prisma migrate dev --name add_directory_item --schema=schema/schema.prisma
# → creates schema/migrations/xxx_add_directory_item/migration.sql, applies to mock_aiorbit, regenerates client

node prisma/seed.mjs          # seeds 2234 real companies from experiment/data/companies/raw.json
# verify
psql "postgresql://aiorbit:aiorbit@localhost:5433/mock_aiorbit" -c "select count(*) from \"DirectoryItem\" where resource='companies';"
# → 2234

# optional API on 3002
npm run dev                   # http://localhost:3002/api/v1/companies
```

Frontend owns Prisma Client (server-only) — `frontend/.env` DATABASE_URL points to `5433/mock_aiorbit`, `frontend/src/lib/directory.ts` full `itemsFor(resource)` → `DirectoryRoute` async.

## Frontend verify
```bash
cd ../frontend
npx prisma generate
npm run dev   # http://localhost:3000/companies
curl "http://localhost:3000/api/v1/companies?page=1&pageSize=5&q=01.AI"
```
