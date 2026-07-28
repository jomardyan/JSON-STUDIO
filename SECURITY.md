# Security Policy

## Security Model & Privacy Guarantee

JSON Studio Pro is engineered as a **100% client-side application**. All format conversions, JSON repairs, schema generation, SQL queries, and visual profiling execute directly inside the user's browser runtime.

- **No Remote Telemetry:** No user payload data or uploaded documents are transmitted to remote servers.
- **Private Session Mode:** Opt-in zero-storage mode prevents writing payload strings to browser `localStorage` or `IndexedDB`.
- **Credential Redaction:** API keys, Bearer tokens, and authorization headers are automatically masked in output views.

## Reporting Vulnerabilities

If you discover a potential security vulnerability or sensitive exposure in JSON Studio Pro:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability directly via GitHub Security Advisory or email the maintainers at `support@loli.eu`.
3. Provide step-by-step reproduction instructions, payload examples, and browser context.

We respond to security disclosures within 24 hours.
