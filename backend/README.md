# Pakshi Expenses — Scriptable Google Sheets Backend

This backend belongs only to the Scriptable prototype track.

## Architecture

Scriptable on iPhone → Google Apps Script Web App → Google Sheet

The native Swift/Supabase application does not use this backend.

## Setup

1. Create a dedicated Google Sheet for Pakshi Scriptable.
2. Open **Extensions → Apps Script**.
3. Replace the Apps Script editor contents with `google-apps-script.js` from this folder.
4. Add Script Property:
   - Name: `PAKSHI_API_TOKEN`
   - Value: a long random secret shared only with the two Scriptable clients.
5. Deploy → New deployment → Web app.
6. Execute as: **Me**.
7. Who has access: **Anyone**.
8. Copy the Web App URL into Scriptable V6 on each phone.

The backend creates these sheets automatically:

- Members
- Categories
- Expenses
- Income
- Savings
- Budgets

## Security boundary

This is a **prototype backend**, not production authentication. The shared API token is a bearer secret. Anyone who obtains it can call the Web App.

Do not store bank credentials, Supabase service-role keys, or other high-value secrets here.

For production, the existing Supabase/RLS architecture remains the security boundary.
