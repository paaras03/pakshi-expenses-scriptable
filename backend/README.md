# Pakshi Expenses — Scriptable Google Sheets Backend

This backend belongs only to the Scriptable prototype track.

## Architecture

Scriptable on iPhone → Google Apps Script Web App → Google Sheet

The native Swift/Supabase application does not use this backend.

## Setup

1. Create a dedicated Google Sheet for Pakshi Scriptable.
2. Set the Sheet sharing to **Anyone with the link → Editor**.
3. Open **Extensions → Apps Script**.
4. Replace the Apps Script editor contents with `google-apps-script.js` from this folder.
5. Deploy → New deployment → Web app.
6. Execute as: **Me**.
7. Who has access: **Anyone**.
8. Copy the Web App URL into Scriptable V6 on each phone.

No API token or Script Property is required in this prototype.

The backend creates these sheets automatically:

- Members
- Categories
- Expenses
- Income
- Savings
- Budgets

## Security boundary

This is a **personal prototype configuration**. The Google Sheet is intentionally editable by anyone who has its link, and the Apps Script endpoint does not authenticate callers.

Anyone who obtains the Sheet link may directly edit the data, and anyone who obtains the Web App URL may call the backend actions.

Do not use this configuration for production financial data or sensitive information.

For production, the existing Supabase/RLS architecture remains the security boundary.
