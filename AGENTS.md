# AGENTS.md

CalClone — Calendly-like booking app. Three independent packages at repo root, no root-level package.json.

## Structure

- `backend/` — NestJS 11 + Prisma 7 + PostgreSQL. Entry: `src/main.ts`. All API routes prefixed `/api`.
- `frontend/` — React 19 + Vite 8 + Mantine 9 + TanStack Router + Zustand.
- `api-contract/` — API spec and TypeSpec definitions (source of truth for endpoints).

## Commands

All commands run inside `backend/` or `frontend/` directories. No root scripts.

```bash
# Backend
cd backend
npm install
npx prisma generate          # REQUIRED before build/test — generates client to src/generated/
npx prisma migrate dev        # run migrations against local postgres
npm run start:dev             # dev server on :3001
npm run lint                  # eslint with prettier
npm test                      # jest unit tests (src/**/*.spec.ts)
npm run test:e2e              # jest e2e (test/**/*.e2e-spec.ts) — needs running postgres

# Frontend
cd frontend
npm install
npm run dev                   # vite dev server on :5173
npm run build                 # tsc -b && vite build
npm run lint                  # eslint
```

## Docker Compose

Full stack via `docker compose up` — postgres (:5432), backend (:3001), frontend (:5173).

## Prisma

- Provider is `prisma-client` (Prisma v7), NOT `@prisma/client`. Generated output goes to `src/generated/` (gitignored).
- Always run `npx prisma generate` after schema changes and after fresh install.
- Config in `prisma.config.ts` reads `DATABASE_URL` from `.env` via dotenv.
- E2e tests use `.env.test` → `calclone_test` database.

## Environment

- Backend `.env` and `.env.test` are committed with dev/placeholder values.
- Frontend `.env` has `VITE_API_URL=http://localhost:3001`.
- Docker Compose sets its own env vars (no `.env` file needed for `docker compose up`).

## Testing

- Backend unit: Jest, test files `src/**/*.spec.ts`.
- Backend e2e: Jest, test files `test/**/*.e2e-spec.ts`, config `test/jest-e2e.json`. Requires running PostgreSQL with `calclone_test` DB.
- Frontend: Vitest + Testing Library configured but no tests written yet.

## Architecture Notes

- Backend modules: `auth`, `bookings`, `events`, `schedule`, `slots`, `users` — each in `src/modules/`.
- Config loaded via `@nestjs/config` from `src/config/configuration.ts`.
- Global validation pipe: `whitelist: true, forbidNonWhitelisted: true, transform: true`.
- Auth: JWT access+refresh tokens in httpOnly cookies via Passport.
- Backend has `common/` with decorators, filters, interceptors.
