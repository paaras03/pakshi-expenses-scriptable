# Scriptable Architecture

## Purpose

The Scriptable repository exists to prototype Pakshi Expenses on iPhone without Xcode.

## Repository boundary

- `paaras03/pakshi-expenses` — native SwiftUI + Supabase production implementation
- `paaras03/pakshi-expenses-scriptable` — Scriptable prototype

These repositories are intentionally independent. Scriptable code is not merged into the native repository.

## Runtime

```
Scriptable (iPhone)
        ↓
Google Apps Script Web App
        ↓
Google Sheet
```

## Data model

The prototype backend maintains:

- Members
- Categories
- Expenses
- Income
- Savings
- Budgets

## Security

The prototype uses a bearer API token stored in Scriptable Keychain and Google Apps Script properties. This is suitable only for a controlled prototype.

Production authentication and authorization remain the responsibility of the native Supabase architecture.
