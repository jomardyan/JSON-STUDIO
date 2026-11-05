.DEFAULT_GOAL := help
.NOTPARALLEL:
NODE ?= node
NPM ?= npm
DOCKER ?= docker
IMAGE ?= json-studio
PORT ?= 3000
.PHONY: help install dev test package lint build preview clean check security docker-build docker-run
help: ## Show commands without installing or building
	@"$(NODE)" scripts/make-support.mjs help
install: ## Install exactly the package-lock.json dependency versions
	"$(NPM)" ci
dev: ## Start the existing Vite development server
	"$(NPM)" run dev
test: ## Run Vitest regressions
	"$(NPM)" test
lint: ## Run the project's TypeScript check
	"$(NPM)" run lint
build: lint ## Type-check before creating the production bundle
	"$(NPM)" run build
package: build ## Create the existing production ZIP in release/
	"$(NODE)" scripts/package.mjs
preview: build ## Build and start the local Vite preview
	"$(NPM)" run preview
check: lint test build ## Run ordered type, regression and production-build checks
security: ## Audit production npm dependencies without changing the lockfile
	"$(NPM)" audit --omit=dev --audit-level=moderate
clean: ## Remove generated builds/packages/cache; preserve source and settings
	"$(NODE)" scripts/make-support.mjs clean
docker-build: ## Build the local IMAGE container
	"$(DOCKER)" build -t "$(IMAGE)" .
docker-run: ## Run the existing container on the selected local PORT
	"$(DOCKER)" run -p "$(PORT):3000" "$(IMAGE)"
