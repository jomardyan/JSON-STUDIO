# JSON Studio Pro

[![CI](https://github.com/jomardyan/JSON-STUDIO/actions/workflows/ci.yml/badge.svg)](https://github.com/jomardyan/JSON-STUDIO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A browser-based workspace for formatting, validating, repairing and converting structured data.
It handles 18 text formats, generates SQL and typed code models from JSON payloads, and ships a
set of inspection tools (diff, jq, JSONPath, JWT, profiler) around a single editor.

Everything runs locally in the browser. There is no backend, no account, and no request that
carries your payload off the machine.

**Live app: [studio.lolisoft.eu](https://studio.lolisoft.eu)**

## Formats

Conversion runs through a shared adapter registry ([`src/adapters/formatRegistry.ts`](src/adapters/formatRegistry.ts))
that declares how completely each format can be read and written. Three formats are code
targets and cannot be parsed back into JSON; the rest round-trip within the documented limits
of their parser.

| Format | Extensions | Parse to JSON | Generate from JSON |
| :--- | :--- | :---: | :---: |
| JSON | `.json` | Full | Full |
| NDJSON / JSON Lines | `.ndjson` `.jsonl` | Full | Full |
| URL query parameters | — | Full | Partial |
| JSON5 / JSONC | `.json5` `.jsonc` | Partial | Partial |
| YAML | `.yaml` `.yml` | Partial | Partial |
| TOML | `.toml` | Partial | Partial |
| XML | `.xml` | Partial | Partial |
| CSV / TSV | `.csv` | Partial | Partial |
| SQL | `.sql` | Partial | Partial |
| HCL / Terraform | `.hcl` `.tf` | Partial | Partial |
| INI | `.ini` `.cfg` | Partial | Partial |
| Java properties | `.properties` | Partial | Partial |
| Dotenv | `.env` | Partial | Partial |
| Markdown table | `.md` | Partial | Partial |
| HTML table | `.html` | Partial | Partial |
| TypeScript interface | `.ts` | — | Partial |
| Python dict | `.py` | — | Partial |
| PHP array | `.php` | — | Partial |

The registry also drives the compatibility matrix in the UI, which flags a conversion as
lossy before you run it — for example CSV, which flattens nested objects and drops type
information.

## Tools

| Tool | What it does |
| :--- | :--- |
| SQL Studio | `CREATE TABLE` DDL and batched `INSERT` statements for MySQL/MariaDB, PostgreSQL, SQLite and MS SQL Server, with per-dialect identifier quoting and type inference |
| Side-by-side diff | Compares two documents with delta highlighting and patch export |
| Code generator | Typed models for TypeScript, Python, Go, Rust, C#, Java, Kotlin, Swift and Dart |
| jq playground | Runs jq expressions against the current payload |
| Transform tools | Key casing (camel, snake, kebab), PII masking and JSONPath queries |
| JSON Patch | Generates and applies RFC 6902 patches and RFC 7386 merge patches |
| API specs | OpenAPI 3.0 documents, cURL commands and GraphQL schemas inferred from a payload |
| LLM tool specs | OpenAI function declarations, Gemini tool specs, Zod schemas and TypeBox types |
| JWT inspector | Decodes header and claims, and reports expiry |
| Object graph | Node view of nesting and entity relationships |
| Payload profiler | Type distribution, nesting depth, key counts and size breakdown |
| Charts | Bar, line, area and pie charts over array data |
| Batch processor | Converts multiple dropped files in one pass |
| URL fetcher | Loads a payload from an HTTP endpoint |

A command palette (`Ctrl`/`Cmd` + `K`) searches every tool, converter and bundled sample.
Large conversions are handed to a web worker ([`src/workers/conversionWorker.ts`](src/workers/conversionWorker.ts))
so the editor stays responsive.

### Syntax repair

The repair pass ([`src/utils/jsonUtils.ts`](src/utils/jsonUtils.ts)) accepts malformed input and fixes:

- unquoted object keys — `{name: "John"}` becomes `{"name": "John"}`
- single-quoted strings — `{'role': 'admin'}` becomes `{"role": "admin"}`
- trailing commas in objects and arrays
- `//` line comments and `/* */` block comments
- Python literals — `True`, `False` and `None`

## Keyboard shortcuts

`Cmd` replaces `Ctrl` on macOS.

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Ctrl + P` | Command palette |
| `Ctrl + Enter` | Format and beautify |
| `Ctrl + Shift + M` | Minify |
| `Ctrl + Shift + R` | Repair syntax |
| `Ctrl + Shift + C` | Copy output |
| `Ctrl + Shift + X` | Move output into input |
| `Ctrl + /` | Shortcut reference |
| `Esc` | Close the open dialog |

## Privacy

Parsing, conversion, code generation and every other operation happen in the browser. The app
sends no payload to a server, includes no analytics, and stores nothing remotely. Preferences
and history are kept in `localStorage` on the device and can be cleared from Settings.

The one operation that leaves the browser is the URL fetcher, which requests the endpoint you
enter.

## Getting started

Requires Node.js 20 or newer. CI builds against Node 20, and the Docker image is based on
`node:20-alpine`.

```bash
git clone https://github.com/jomardyan/JSON-STUDIO.git
cd JSON-STUDIO
npm install
npm run dev
```

The dev server listens on [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the built bundle |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright UI audit |
| `npm run clean` | Remove build artifacts and caches |

`make` wraps the same commands and works from CMD, PowerShell, Git Bash, macOS and Linux
(`make help` lists the targets). `make check` runs the type check and build together.

### Docker

```bash
make docker-build
make docker-run
```

The multi-stage [Dockerfile](Dockerfile) builds the bundle and serves `dist/` on port 3000.

### Deployment

The canonical host is `studio.lolisoft.eu`. The former `json.lolisoft.eu` host should return a
permanent redirect to it so existing links and search rankings carry over.

## Project structure

```text
src/
├── adapters/         Format registry and codecs shared by every converter
├── components/       Editor chrome and the tool dialogs
├── config/           Version and URL constants
├── utils/            Parsing, repair, profiling and generator engines
├── workers/          Off-main-thread conversion worker
├── App.tsx           Workspace composition and state
└── main.tsx          Entry point
public/               PWA manifest, service worker, icons and crawler files
```

The app is installable as a PWA. After the first visit the service worker
([`public/sw.js`](public/sw.js)) serves the shell from cache, so the tools keep working offline.
The interface is available in English, Polish, German, Spanish and French.

## Contributing

Bug reports and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow and [SECURITY.md](SECURITY.md) for reporting vulnerabilities. Run `npm run lint` and
`npm test` before opening a pull request; CI runs both plus a production build.

## License

[MIT](LICENSE)
