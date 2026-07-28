# Contributing to JSON Studio Pro

Thank you for your interest in contributing to **JSON Studio Pro**!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jomardyan/JSON-STUDIO.git
   cd JSON-STUDIO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```

4. **Run type checks & Vitest test suite:**
   ```bash
   npx tsc --noEmit
   npm test
   ```

5. **Build production assets:**
   ```bash
   npm run build
   ```

## Adding a New Format Adapter

All format conversion logic is registered in [`src/adapters/formatRegistry.ts`](file:///c:/Users/jomar/JSON-STUDIO/src/adapters/formatRegistry.ts).

To add support for a new data format:
1. Define a `FormatAdapter` instance containing `id`, `name`, `extensions`, `mimeTypes`, `capabilities`, `parse()`, and `serialize()`.
2. Add unit tests under [`src/adapters/__tests__/formatRegistry.test.ts`](file:///c:/Users/jomar/JSON-STUDIO/src/adapters/__tests__/formatRegistry.test.ts).
3. Register the format in the 14x14 Conversion Compatibility Matrix.

## Code Style & PR Guidelines

- Keep client-side processing 100% private and in-browser.
- Do not add remote network requests without clear opt-in UI disclosures.
- Verify `npx tsc --noEmit` and `npm test` pass cleanly before submitting a Pull Request.
