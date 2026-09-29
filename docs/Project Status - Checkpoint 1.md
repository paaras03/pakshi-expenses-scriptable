# Pakshi Expenses — Scriptable Prototype
# Project Status — Checkpoint 1

Date: 2026-09-29

## 1. Purpose
This is the continuity checkpoint for the standalone Scriptable prototype. It is the source of truth for the next development chat.

## 2. Repository Boundary
Scriptable prototype: https://github.com/paaras03/pakshi-expenses-scriptable
Native production app: https://github.com/paaras03/pakshi-expenses
Scriptable code must not be merged into the native repository.

## 3. Locked Architecture Decision
Current Scriptable architecture:
Scriptable → Google Apps Script Web App → Google Sheet

Important: there is NO decision to move the Scriptable prototype to Supabase. Supabase is the separate native production backend architecture. Do not change Scriptable to Supabase unless explicitly approved.

## 4. Prototype Security
The prototype uses a publicly editable Google Sheet and an unauthenticated Apps Script Web App. There is no API token. This is prototype-only and is not appropriate for production financial data.

## 5. Backend
Google Sheet: https://docs.google.com/spreadsheets/d/11n-oiPMewe_0jIShGfGMOqY1uCH3ciYI5V-Q3wXFJVE/edit?usp=drivesdk
Apps Script project: Pakshi Expenses — Scriptable Backend
Latest deployment URL supplied during development: https://script.google.com/macros/s/AKfycbwCu62ay8d--NgH3OhxUWj5DD7GtIFfhtzEe-qF_7ThxNmXCX0zDn8Hw45kHyj1rYlz/exec

## 6. Current Data Model
Members: id, name, role
Categories: id, name, iconKey, sortOrder, isDefault
Expenses: id, date, amount, categoryId, description, paymentMethod, paidBy, notes, createdAt, updatedAt, deleted
Income: month, firstMemberAmount, secondMemberAmount, updatedAt
Savings: ownerType, amount, asOfDate, updatedAt
Budgets: id, month, categoryId, amount, updatedAt

## 7. V6 Scope
- Four primary tabs: Home, Add, Budget, Settings
- Expense create/edit/delete
- Income detail/edit
- Savings detail/edit
- Category expense drill-down
- Expense sorting
- CSV export
- Editable budgets
- Household member setup/persistence
- Google Sheets persistence
- Canonical V1 category/navigation icon system
- No Supabase connection

## 8. Transport History
POST mutations through Apps Script were unreliable in Scriptable. Direct diagnostics showed network connection lost / HTML Page Not Found behavior in some redirect cases.
Relevant commits:
- 3bdda4558b8749633ac5e757b5ba171ec8312418 — direct POST diagnostic
- c9877c652c417f27494f2e4cc7f0597089f84c00 — Apps Script POST redirect handling
- 2a3709b49fd59d087bea77c96b78fe6726f52d5b — verify expense save after write
- 24dc486839fb80169e77a680573b28d373405786 — idempotent expense writes
- 9c1c6af096854455c9a64a16b1d6472c49539679 — restore missing renderBudgetEdit
- 7b00db26d4d1ad1dc76b08110b7efd95f2a46e0a — support GET mutation transport
- d7cf852e8d29fa7cbc0bb6048bb04f75a5175aaa — use GET transport for Scriptable writes
- 304b2b6a03695b778c340e108ec4d7fab0e0dec7 — document GET mutation transport

Current transport: Scriptable sends mutations as GET with URL-encoded JSON payload; Apps Script routes the payload through the mutation logic.

## 9. Current Performance Problem
Expense saves can take approximately 8–10 seconds. The success message can appear only after the delay. In one test, five taps eventually resulted in five saves. GET transport improved reliability but did not solve latency.

Possible contributors have not yet been measured separately:
- Apps Script cold start
- ContentService redirect/response handling
- Spreadsheet service latency
- sheet reads/scans
- append/update operations
- post-write bootstrap refresh
- Scriptable networking

Do not assume a backend migration is the answer. Measure first.

## 10. Runtime Error State
A previous regression produced: ReferenceError: Can't find variable: renderBudgetEdit. That was fixed in commit 9c1c6af096854455c9a64a16b1d6472c49539679.
Immediately before this checkpoint I reported that the Scriptable script was throwing an error again, but the exact latest error has not been captured.
Therefore the next chat must capture the exact current error before modifying code.

## 11. Confirmed / Tested
- Apps Script GET/bootstrap path works.
- Google Sheets persistence works.
- Expense saves have succeeded through the current transport.
- Direct POST diagnostic established the POST transport problem.
- GET mutation transport improved reliability.
- Expense verification/idempotency work exists.
- Budget renderer regression was identified and fixed.
- Canonical icon system is implemented.

## 12. Not Adequately Tested
- Exact current runtime error, if any.
- Exact latency breakdown.
- Whether latency is primarily Apps Script, Sheets, redirect handling, or post-write refresh.
- Edit expense end-to-end after latest transport changes.
- Delete expense end-to-end after latest transport changes.
- Income edit end-to-end.
- Savings edit end-to-end.
- Budget save end-to-end.
- Repeated-tap behavior after the final current build.
- Offline/reconciliation behavior.

## 13. Immediate Engineering Sequence
1. Run the current Scriptable build and capture the exact runtime error if one occurs.
2. Fetch the latest GitHub source before changing anything.
3. Instrument the write path with timestamps for Scriptable request, Apps Script entry, sheet write, Apps Script response, Scriptable response, and post-write refresh.
4. Locate the actual 8–10 second bottleneck.
5. Optimize the existing Google Sheets + Apps Script path before considering architecture changes.
6. Only after measurement, evaluate a local-first/pending-write UX if remote latency remains unavoidable.
7. Regression-test all mutation flows.

## 14. Engineering Rules
- Keep Scriptable and native in separate repositories.
- Do not switch Scriptable to Supabase without explicit approval.
- Fetch the latest file before modifying it.
- Make one controlled change at a time.
- Maintain meaningful Git commits.
- Document tested vs untested behavior.
- Never put secrets in Scriptable source or GitHub.

## 15. Next Chat Handoff Prompt
We are continuing the Pakshi Expenses standalone Scriptable prototype.

Read docs/Project Status - Checkpoint 1.md first and treat it as the source of truth.

Repository: https://github.com/paaras03/pakshi-expenses-scriptable

Critical architecture decision: Scriptable remains Scriptable + Google Apps Script + Google Sheets. We have NOT decided to move Scriptable to Supabase. Do not switch the backend unless I explicitly approve it.

The separate native production app is https://github.com/paaras03/pakshi-expenses and uses SwiftUI + Supabase.

Current problem: Scriptable expense writes can take approximately 8–10 seconds. GET mutation transport was introduced because POST through Apps Script was unreliable. GET improved reliability but did not solve latency.

I also recently reported that the Scriptable script was throwing an error. Do not guess what it is. First run/capture the exact current error.

Act as senior iOS/JavaScript/backend engineer and CTO:
1. Fetch the latest GitHub state before changing anything.
2. Establish whether the current Scriptable build has a runtime error.
3. If there is an error, fix that first and commit it.
4. Instrument the write path to measure Scriptable request start, Apps Script entry, sheet-write start/end, Apps Script response, Scriptable response, and post-write refresh.
5. Determine exactly where the 8–10 seconds is being spent.
6. Optimize Google Sheets/Apps Script before considering any backend migration.
7. Do not make multiple architectural changes at once.
8. Keep GitHub history clean with meaningful commits.
9. Update checkpoint documentation after meaningful milestones.

At decisions, explicitly distinguish: Your preference; Technical decision; Trade-off; Decision.

Give me only one manual step at a time when I need to interact with Scriptable, Google Apps Script, or Xcode.

Do not blindly agree with my suggestions. Recommend the technically sound next step and explain why briefly.