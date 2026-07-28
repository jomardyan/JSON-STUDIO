#!/usr/bin/env bash
# ==============================================================================
# JSON Studio - Build & Utility Script (make.sh)
# Usage: ./make.sh [command]
# ==============================================================================

set -e

# Color definitions
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
RESET='\033[0m'

function show_help() {
  echo -e "${BOLD}JSON Studio Make Script${RESET}"
  echo -e "Usage: ./make.sh [command]\n"
  echo -e "Commands:"
  echo -e "  ${CYAN}install${RESET}       Install project npm dependencies"
  echo -e "  ${CYAN}dev${RESET}           Start Vite development server on port 3000"
  echo -e "  ${CYAN}lint${RESET}          Run TypeScript type-checker"
  echo -e "  ${CYAN}build${RESET}         Lint and build production bundle"
  echo -e "  ${CYAN}preview${RESET}       Preview production build locally"
  echo -e "  ${CYAN}clean${RESET}         Remove build artifacts and cache"
  echo -e "  ${CYAN}check${RESET}         Run full verification pipeline (lint + build)"
  echo -e "  ${CYAN}docker-build${RESET}  Build local Docker container"
  echo -e "  ${CYAN}docker-run${RESET}    Run Docker container on http://localhost:3000"
  echo -e "  ${CYAN}help${RESET}          Display this help message"
}

COMMAND="${1:-help}"

case "$COMMAND" in
  install)
    echo -e "${GREEN}==> Installing npm packages...${RESET}"
    npm install
    ;;
  dev)
    echo -e "${GREEN}==> Starting development server...${RESET}"
    npm run dev
    ;;
  lint)
    echo -e "${GREEN}==> Running linter / typecheck...${RESET}"
    npm run lint
    ;;
  build)
    echo -e "${GREEN}==> Linting and building production output...${RESET}"
    npm run lint
    npm run build
    echo -e "${GREEN} Build completed successfully! Output in dist/${RESET}"
    ;;
  preview)
    echo -e "${GREEN}==> Previewing production build...${RESET}"
    npm run preview
    ;;
  clean)
    echo -e "${YELLOW}==> Cleaning dist and build cache...${RESET}"
    npm run clean
    echo -e "${GREEN} Clean completed.${RESET}"
    ;;
  check)
    echo -e "${GREEN}==> Running full project check...${RESET}"
    npm run lint
    npm run build
    echo -e "${GREEN} All checks passed!${RESET}"
    ;;
  docker-build)
    echo -e "${GREEN}==> Building Docker image json-studio...${RESET}"
    docker build -t json-studio .
    ;;
  docker-run)
    echo -e "${GREEN}==> Running Docker container on port 3000...${RESET}"
    docker run -p 3000:3000 json-studio
    ;;
  help|*)
    show_help
    ;;
esac
