# ==============================================================================
# JSON Studio - Build & Development Makefile
# ==============================================================================

.PHONY: help install dev build lint preview clean check docker-build docker-run

# Default target when running 'make'
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "JSON Studio - Available Commands:"
	@echo "=================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install all npm dependencies
	@echo "Installing dependencies..."
	npm install

dev: ## Start development server on port 3000
	@echo "Starting dev server..."
	npm run dev

lint: ## Run TypeScript type-checking and linter
	@echo "Running linter..."
	npm run lint

build: lint ## Lint and build the production bundle
	@echo "Building production application..."
	npm run build

preview: build ## Build and preview production app locally
	@echo "Starting production preview..."
	npm run preview

clean: ## Clean build artifacts and dist folder
	@echo "Cleaning build artifacts..."
	npm run clean
	rm -rf .vite node_modules/.vite

check: lint build ## Perform full validation (lint + build)
	@echo "All checks passed successfully!"

docker-build: ## Build Docker container image
	@echo "Building Docker image 'json-studio'..."
	docker build -t json-studio .

docker-run: ## Run Docker container on port 3000
	@echo "Running Docker container on http://localhost:3000 ..."
	docker run -p 3000:3000 json-studio
