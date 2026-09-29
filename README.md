# Pakshi Expenses — Scriptable

Standalone Scriptable prototype of Pakshi Expenses for iPhone.

## Architecture

```
Scriptable (iPhone)
        ↓
Google Apps Script Web App
        ↓
Google Sheet
```

This repository is intentionally separate from the native SwiftUI/Supabase repository.

- Native production app: `paaras03/pakshi-expenses`
- Scriptable prototype: this repository

## Structure

- `src/pakshi-v6.js` — Scriptable V6 application
- `backend/google-apps-script.js` — Google Apps Script backend
- `backend/README.md` — backend deployment/setup
- `docs/V6.md` — V6 scope and known limitations
- `docs/ARCHITECTURE.md` — architecture boundary and responsibilities

## Run

Open `src/pakshi-v6.js` in Scriptable and run it. On first run, enter the deployed Google Apps Script Web App URL and API token.

## Important

This is a prototype. The Google Apps Script bearer token is not equivalent to Supabase Auth + RLS and must not be treated as production security.
