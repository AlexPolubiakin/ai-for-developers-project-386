SHELL := /bin/sh

BACKEND_DIR := backend
FRONTEND_DIR := frontend
CONTRACT_DIR := api-contract
COMPOSE := docker compose

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show all project commands
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: backend-install frontend-install contract-install ## Install dependencies for all packages

.PHONY: backend-install
backend-install: ## Install backend dependencies
	cd $(BACKEND_DIR) && npm install

.PHONY: frontend-install
frontend-install: ## Install frontend dependencies
	cd $(FRONTEND_DIR) && npm install

.PHONY: contract-install
contract-install: ## Install API contract dependencies
	cd $(CONTRACT_DIR) && npm install

.PHONY: dev
dev: docker-up ## Start the full stack with Docker Compose

.PHONY: backend-dev
backend-dev: ## Start backend dev server on :3001
	cd $(BACKEND_DIR) && npm run start:dev

.PHONY: frontend-dev
frontend-dev: ## Start frontend dev server on :5173
	cd $(FRONTEND_DIR) && npm run dev

.PHONY: frontend-preview
frontend-preview: ## Preview frontend production build
	cd $(FRONTEND_DIR) && npm run preview

.PHONY: prisma-generate
prisma-generate: ## Generate Prisma client for backend
	cd $(BACKEND_DIR) && npx prisma generate

.PHONY: prisma-migrate
prisma-migrate: ## Run backend Prisma migrations against local database
	cd $(BACKEND_DIR) && npx prisma migrate dev

.PHONY: contract-compile
contract-compile: ## Validate TypeSpec contract without emitting files
	cd $(CONTRACT_DIR) && npm run compile

.PHONY: contract-openapi
contract-openapi: ## Generate OpenAPI output from TypeSpec contract
	cd $(CONTRACT_DIR) && npm run build:openapi

.PHONY: backend-build
backend-build: prisma-generate ## Build backend
	cd $(BACKEND_DIR) && npm run build

.PHONY: frontend-build
frontend-build: ## Build frontend
	cd $(FRONTEND_DIR) && npm run build

.PHONY: build
build: contract-compile backend-build frontend-build ## Build/validate all project parts

.PHONY: backend-lint
backend-lint: ## Run backend lint
	cd $(BACKEND_DIR) && npm run lint

.PHONY: frontend-lint
frontend-lint: ## Run frontend lint
	cd $(FRONTEND_DIR) && npm run lint

.PHONY: lint
lint: backend-lint frontend-lint ## Run all linters

.PHONY: backend-test
backend-test: prisma-generate ## Run backend unit tests
	cd $(BACKEND_DIR) && npm test

.PHONY: backend-test-watch
backend-test-watch: prisma-generate ## Run backend unit tests in watch mode
	cd $(BACKEND_DIR) && npm run test:watch

.PHONY: backend-test-cov
backend-test-cov: prisma-generate ## Run backend unit tests with coverage
	cd $(BACKEND_DIR) && npm run test:cov

.PHONY: backend-test-e2e
backend-test-e2e: prisma-generate ## Run backend e2e tests; requires PostgreSQL/test database
	cd $(BACKEND_DIR) && npm run test:e2e

.PHONY: frontend-test
frontend-test: ## Run frontend tests with Vitest
	cd $(FRONTEND_DIR) && npm exec vitest run

.PHONY: frontend-test-watch
frontend-test-watch: ## Run frontend tests in watch mode with Vitest
	cd $(FRONTEND_DIR) && npm exec vitest

.PHONY: test
test: backend-test frontend-test ## Run all unit tests

.PHONY: test-all
test-all: backend-test backend-test-e2e frontend-test ## Run unit and e2e tests

.PHONY: check
check: contract-compile lint test frontend-build backend-build ## Run contract validation, lint, tests, and builds

.PHONY: docker-up
docker-up: ## Start postgres, backend, and frontend with Docker Compose
	$(COMPOSE) up

.PHONY: docker-up-build
docker-up-build: ## Build and start the full stack with Docker Compose
	$(COMPOSE) up --build

.PHONY: docker-down
docker-down: ## Stop Docker Compose services
	$(COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Follow Docker Compose logs
	$(COMPOSE) logs -f

.PHONY: clean
clean: ## Remove generated frontend/backend build artifacts
	rm -rf $(FRONTEND_DIR)/dist $(BACKEND_DIR)/dist coverage
