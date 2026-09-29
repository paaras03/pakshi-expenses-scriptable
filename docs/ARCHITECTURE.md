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

## Transport

The prototype uses GET for both reads and mutations. Mutation payloads are sent as URL-encoded JSON to the Apps Script Web App, which reuses the backend write handlers. This is intentionally a prototype transport choice because Scriptable + Apps Script POST response redirects were slow and unreliable in testing.

The prototype does not require bearer-token authentication. The Google Sheet is configured as “Anyone with the link can edit” and the Apps Script Web App is deployed with access set to Anyone. This is suitable only for a throwaway prototype; it is not appropriate for sensitive or production financial data.

Production authentication and authorization remain the responsibility of the native Supabase architecture.
