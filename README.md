### Hexlet tests and linter status:
[![Actions Status](https://github.com/AlexPolubiakin/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/AlexPolubiakin/ai-for-developers-project-386/actions)

## Deployed Application

https://calclone-y37m.onrender.com/

## Project Commands

All common commands are available through the root `Makefile`.

```bash
make help
```

Main groups:

- `make install` — install dependencies for `backend`, `frontend`, and `api-contract`.
- `make dev` — start the full stack with Docker Compose.
- `make backend-dev` / `make frontend-dev` — start backend or frontend locally.
- `make contract-compile` / `make contract-openapi` — validate TypeSpec or generate OpenAPI.
- `make build` — validate contract and build backend/frontend.
- `make lint` — run backend and frontend linters.
- `make test` — run backend and frontend unit tests.
- `make test-all` — run unit tests and backend e2e tests.
- `make check` — run contract validation, lint, tests, and builds.
- `make docker-up`, `make docker-up-build`, `make docker-down`, `make docker-logs` — Docker Compose helpers.