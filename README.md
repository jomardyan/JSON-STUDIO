# JSON Studio Pro v2.7.0 🚀

[![Version](https://img.shields.io/badge/version-2.7.0-indigo.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-emerald.svg)](public/sw.js)
[![Client-Side Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-purple.svg)](#-privacy--security-guarantee)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#-getting-started)

**JSON Studio Pro** is a high-performance, 100% client-side data formatting, conversion, and developer studio suite. Built for modern engineers, JSON Studio converts, repairs, queries, profiles, and visualizes complex data structures with zero latency and 100% offline privacy.

🌐 **Live Web Application:** [https://json.lolisoft.eu](https://json.lolisoft.eu)  
📦 **GitHub Repository:** [https://github.com/jomardyan/JSON-STUDIO](https://github.com/jomardyan/JSON-STUDIO)

---

## ✨ Key Features

### ⚡ 1. Spotlight Command Palette (`Ctrl + K` / `Cmd + K`)
- Instant fuzzy search across **45+ tools, formatters, converters, studios, and samples**.
- Full keyboard arrow key navigation (`Up` / `Down`), `Enter` execution, and `Esc` dismissal.

### 🔄 2. Universal Multi-Format Converter
Instant bidirectional conversion between:
- **JSON** ➔ **CSV / Excel**
- **JSON** ➔ **XML Document** (Custom root tags & attributes)
- **JSON** ➔ **YAML Manifest** (Kubernetes & Docker config ready)
- **JSON** ➔ **SQL Script** (`CREATE TABLE` DDL & batch `INSERT INTO` queries)
- **JSON** ➔ **TOML Configuration**
- **JSON** ➔ **HTML <table> Markup**
- **JSON** ➔ **Markdown Table** (GitHub Flavored Markdown)
- **JSON** ➔ **TypeScript Interfaces** & Data Models
- **JSON** ➔ **NDJSON / JSON Lines**
- **JSON** ➔ **Python Dict** & **PHP Array** Literals
- **JSON** ➔ **URL Query Parameters** & **Properties / .env**

### 🛠️ 3. Integrated Suite of 15+ Developer Studios

| Developer Studio | Description | Shortcut |
| :--- | :--- | :---: |
| **SQL Studio & Generator** | Custom table naming, batch insert sizing, and multi-dialect SQL generation (MySQL, PostgreSQL, SQLite, MS SQL) | — |
| **Side-by-Side Visual Diff** | Compare two JSON objects with side-by-side delta highlighting and patch export | `Ctrl+Shift+D` |
| **Case & PII Transformer** | Convert key casing (camelCase, snake_case, kebab-case), mask PII fields, run JSONPath queries | — |
| **Multi-Lang Code Generator** | Generate production models in TypeScript, Python, Go, Rust, C#, Java, Swift, Dart | `Ctrl+Shift+G` |
| **jq Query Playground** | Execute UNIX `jq` expressions (`.users[] \| select(.age > 30)`) on live data | `Ctrl+Shift+Q` |
| **JSON Patch (RFC 6902/7386)** | Generate and apply RFC 6902 JSON Patch & RFC 7386 Merge Patch operations | — |
| **OpenAPI / cURL / GraphQL** | Build OpenAPI 3.0 specs, parse cURL commands, and infer GraphQL schemas | — |
| **JWT Inspector & Claims** | Decode JWT header, payload claims, expiration timestamps, and signature verification | `Ctrl+Shift+J` |
| **Interactive ER & Object Graph** | Explore JSON node hierarchies, entity relationships, and schemas visually | — |
| **Payload Profiler & Metrics** | Type distribution, max nesting depth, payload size breakdown, and top array metrics | — |
| **Multi-File Batch Processor** | Drag & drop batch process and convert multiple files in bulk | — |
| **URL & API Endpoint Fetcher** | Fetch JSON payloads directly from remote HTTP API endpoints | — |
| **Visual Analytics & Charts** | Render interactive Bar, Line, Area, and Pie charts directly from JSON datasets | — |
| **AI / LLM Spec Generator** | Generate OpenAI function declarations, Gemini tool specs, Zod schemas, and TypeBox types | — |

### 🔧 4. Intelligent Syntax Auto-Repair Engine
Fixes invalid JSON syntax automatically:
- Unquoted object keys (`{name: "John"}` ➔ `{"name": "John"}`)
- Single-quoted strings (`{'role': 'admin'}` ➔ `{"role": "admin"}`)
- C-style inline & block comments (`// comment` and `/* block */`)
- Trailing commas in arrays and objects (`[1, 2, 3,]`)
- Python booleans & nulls (`True`, `False`, `None`)

### 📡 5. 100% Offline Mode (PWA Service Worker)
- **Zero Internet Connection Required after first load:** The service worker caches the application shell and runtime assets for later offline sessions.
- **Standalone PWA Installation:** Install as a native desktop or mobile app.
- **Network Status Detector:** Real-time online/offline indicator badge.

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut (Windows / Linux) | Shortcut (macOS) |
| :--- | :---: | :---: |
| **Command Palette** | `Ctrl + K` or `Ctrl + P` | `Cmd + K` or `Cmd + P` |
| **Format & Beautify** | `Ctrl + Enter` | `Cmd + Enter` |
| **Minify JSON** | `Ctrl + Shift + M` | `Cmd + Shift + M` |
| **Auto-Repair Syntax** | `Ctrl + Shift + R` | `Cmd + Shift + R` |
| **Copy Output** | `Ctrl + Shift + C` | `Cmd + Shift + C` |
| **Swap Output ➔ Input** | `Ctrl + Shift + X` | `Cmd + Shift + X` |
| **Keyboard Shortcuts Cheat Sheet** | `Ctrl + /` | `Cmd + /` |

---

## 🔒 Privacy & Security Guarantee

> [!IMPORTANT]
> **Your data never leaves your computer.**
> All formatting, validation, repair, conversion, and code generation operations are executed **100% inside your browser's local memory**. JSON Studio Pro performs **zero server uploads**, zero analytics tracking of your payloads, and stores nothing on external servers.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jomardyan/JSON-STUDIO.git
   cd JSON-STUDIO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

### Cross-Platform Makefile Support (Windows & Linux)
JSON Studio Pro includes cross-platform build automation for both Linux (`make`) and Windows PowerShell/CMD (`make.bat`, `make.ps1`):

```bash
# Start development server
make dev

# Build production bundle
make build

# Clean build artifacts
make clean
```

---

## 📁 Repository Architecture

```text
JSON-STUDIO/
├── public/                  # PWA Manifest, Service Worker, Sitemaps & Icons
│   ├── manifest.json        # Web App Manifest (standalone PWA)
│   ├── sw.js                # Offline Service Worker (Cache-First)
│   ├── icon.svg             # Application Icon
│   └── llms.txt             # Machine-readable documentation for AI agents
├── src/
│   ├── components/          # React Modals, Toolbar & Studio Components
│   │   ├── CommandPaletteModal.tsx  # Spotlight Command Palette
│   │   ├── Header.tsx               # Sticky Navbar & Tools Menu
│   │   ├── SqlConverterModal.tsx    # SQL Studio & DDL Generator
│   │   ├── JsonDiffModal.tsx        # Side-by-Side Visual Diff
│   │   ├── JsonChartsModal.tsx      # Visual Analytics & Charts Studio
│   │   └── ...                      # 15+ Modal Studio Components
│   ├── utils/               # Core Parsing & Conversion Engines
│   │   ├── jsonUtils.ts             # Formatters, Minifiers & Auto-Repair Engine
│   │   ├── formatRegistry.ts        # Shared 18-format adapter registry
│   │   ├── samples.ts               # 21 Built-in Sample Datasets
│   │   └── i18n.ts                  # Multi-language translation engine
│   ├── App.tsx              # Main Workspace Component
│   ├── index.css            # TailwindCSS & Custom Glassmorphic Design System
│   └── main.tsx             # Application Entry Point
├── package.json             # Dependencies & Build Scripts
└── vite.config.ts           # Vite Bundler Configuration
```

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
