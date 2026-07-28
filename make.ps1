# ==============================================================================
# JSON Studio - Windows PowerShell Script (make.ps1)
# Usage: .\make.ps1 [command]
# ==============================================================================

param (
    [string]$Command = "help"
)

switch ($Command.ToLower()) {
    "install" {
        Write-Host "==> Installing dependencies..." -ForegroundColor Green
        npm install
    }
    "dev" {
        Write-Host "==> Starting Vite development server on port 3000..." -ForegroundColor Green
        npm run dev
    }
    "lint" {
        Write-Host "==> Running TypeScript type-checker..." -ForegroundColor Green
        npx tsc --noEmit
    }
    "build" {
        Write-Host "==> Linting and building production output..." -ForegroundColor Green
        npx tsc --noEmit
        npm run build
    }
    "preview" {
        Write-Host "==> Previewing production build..." -ForegroundColor Green
        npm run preview
    }
    "clean" {
        Write-Host "==> Cleaning build artifacts and cache..." -ForegroundColor Yellow
        npm run clean
    }
    "check" {
        Write-Host "==> Running full validation (lint + build)..." -ForegroundColor Green
        npx tsc --noEmit
        npm run build
    }
    "docker-build" {
        Write-Host "==> Building Docker image json-studio..." -ForegroundColor Green
        docker build -t json-studio .
    }
    "docker-run" {
        Write-Host "==> Running Docker container on http://localhost:3000..." -ForegroundColor Green
        docker run -p 3000:3000 json-studio
    }
    Default {
        Write-Host "JSON Studio - PowerShell Build Commands:" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  .\make.ps1 install       Install npm dependencies"
        Write-Host "  .\make.ps1 dev           Start Vite dev server on port 3000"
        Write-Host "  .\make.ps1 lint          Run TypeScript type-checker"
        Write-Host "  .\make.ps1 build         Lint and build production bundle"
        Write-Host "  .\make.ps1 preview       Preview production build"
        Write-Host "  .\make.ps1 clean         Remove build artifacts"
        Write-Host "  .\make.ps1 check         Run full verification (lint + build)"
        Write-Host "  .\make.ps1 docker-build  Build Docker container"
        Write-Host "  .\make.ps1 docker-run    Run Docker container"
    }
}
