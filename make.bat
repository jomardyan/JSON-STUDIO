@echo off
rem ==============================================================================
rem JSON Studio - Windows Batch Script (make.bat)
rem Usage: make [command]
rem ==============================================================================

set CMD=%1
if "%CMD%"=="" set CMD=help

if "%CMD%"=="install" (
    echo [make] Installing npm packages...
    npm install
    goto end
)
if "%CMD%"=="dev" (
    echo [make] Starting development server on port 3000...
    npm run dev
    goto end
)
if "%CMD%"=="lint" (
    echo [make] Running TypeScript type-checker...
    npx tsc --noEmit
    goto end
)
if "%CMD%"=="build" (
    echo [make] Linting and building production output...
    npx tsc --noEmit && npm run build
    goto end
)
if "%CMD%"=="preview" (
    echo [make] Previewing production build...
    npm run preview
    goto end
)
if "%CMD%"=="clean" (
    echo [make] Cleaning build artifacts...
    npm run clean
    goto end
)
if "%CMD%"=="check" (
    echo [make] Running full validation (lint + build)...
    npx tsc --noEmit && npm run build
    goto end
)
if "%CMD%"=="docker-build" (
    echo [make] Building Docker image json-studio...
    docker build -t json-studio .
    goto end
)
if "%CMD%"=="docker-run" (
    echo [make] Running Docker container on http://localhost:3000...
    docker run -p 3000:3000 json-studio
    goto end
)

echo JSON Studio - Windows Build Commands:
echo ======================================
echo   make install       Install npm dependencies
echo   make dev           Start Vite dev server on port 3000
echo   make lint          Run TypeScript type-checker
echo   make build         Lint and build production bundle
echo   make preview       Preview production build locally
echo   make clean         Remove build artifacts and cache
echo   make check         Run full verification (lint + build)
echo   make docker-build  Build Docker container image
echo   make docker-run    Run Docker container on port 3000

:end
