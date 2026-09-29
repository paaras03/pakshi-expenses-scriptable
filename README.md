# Pakshi Expenses — Scriptable

Standalone Scriptable prototype of Pakshi Expenses for iPhone.

## Architecture

Scriptable (iPhone) → Google Apps Script Web App → Google Sheet

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

Open `src/pakshi-v6.js` in Scriptable and run it. On first run, enter the deployed Google Apps Script Web App URL.

## Important

This is a prototype using an intentionally public/editable Google Sheet. There is no API authentication in the Scriptable backend. Anyone with the Sheet link can edit the data.

The native application continues to use Supabase Auth + RLS for production security.
