# ==============================================================================
# JSON Studio - Cross-Platform Build & Development Makefile
# Compatible with Windows (CMD, PowerShell, Git Bash), macOS, and Linux
# ==============================================================================

.PHONY: help install dev test build package lint preview clean check docker-build docker-run

.DEFAULT_GOAL := help

# OS Detection
ifeq ($(OS),Windows_NT)
    IS_WINDOWS := 1
    RM_CMD := node -e "const fs=require('fs'); ['dist','release','server.js','.vite','node_modules/.vite'].forEach(p => fs.rmSync(p, {recursive:true, force:true}))"
else
    IS_WINDOWS := 0
    RM_CMD := rm -rf dist release server.js .vite node_modules/.vite
endif

help: ## Show available Makefile targets
	@echo JSON Studio - Available Commands:
	@echo ==================================
	@echo   make install       Install npm dependencies
	@echo   make dev           Start Vite development server on port 3000
	@echo   make test          Run regression tests
	@echo   make package       Create local production ZIP in release/
	@echo   make lint          Run TypeScript type-checker
	@echo   make build         Lint and build production bundle
	@echo   make preview       Preview production build locally
	@echo   make clean         Clean build artifacts and cache
	@echo   make check         Perform full validation (lint, build, tests)
	@echo   make docker-build  Build Docker container image
	@echo   make docker-run    Run Docker container on port 3000

install: ## Install all npm dependencies
	@echo Installing dependencies...
	npm install

dev: ## Start development server on port 3000
	@echo Starting dev server...
	npm run dev

test: ## Run unit and regression tests
	npm test

package: build ## Package the production site without publishing
	node scripts/package.mjs

lint: ## Run TypeScript type-checking and linter
	@echo Running linter...
	npx tsc --noEmit

build: lint ## Lint and build the production bundle
	@echo Building production application...
	npm run build

preview: build ## Build and preview production app locally
	@echo Starting production preview...
	npm run preview

clean: ## Clean build artifacts and dist folder
	@echo Cleaning build artifacts...
	@$(RM_CMD)

check: lint build test ## Perform full validation (lint, build, tests)
	@echo All checks passed successfully!

docker-build: ## Build Docker container image
	@echo Building Docker image 'json-studio'...
	docker build -t json-studio .

docker-run: ## Run Docker container on port 3000
	@echo Running Docker container on http://localhost:3000 ...
	docker run -p 3000:3000 json-studio
