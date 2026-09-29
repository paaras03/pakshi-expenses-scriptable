# Project Status — Checkpoint 2

Date: 2026-09-30

## Purpose of this checkpoint

This document is the durable handoff for the **Pakshi Expenses Scriptable prototype**.

The Scriptable project is intentionally separate from the native iOS/Supabase project:

- Scriptable repo: `paaras03/pakshi-expenses-scriptable`
- Native iOS repo: `paaras03/pakshi-expenses`

The Scriptable app is a prototype/validation track. It is **not** the production architecture.

The native iOS/Supabase track must not be modified merely to fix or experiment with Scriptable.

---

# 1. End-state direction

The intended product architecture is:

```
Prototype:
Scriptable
   ↓
Google Apps Script
   ↓
Google Sheets

Production:
SwiftUI iOS app
   ↓
Supabase Auth / PostgreSQL / RLS
```

The Scriptable prototype exists to validate:

- product flows
- information architecture
- UI interactions
- data model
- household concepts
- budgeting/income/savings behavior
- transaction workflows
- sorting/filtering behavior
- practical backend transport constraints

Once the prototype is sufficiently stable, it should become a reference/historical prototype rather than an indefinitely maintained second product.

---

# 2. Current Scriptable architecture

## Frontend

The application is a Scriptable JavaScript file:

`src/pakshi-v6.js`

It:

1. Runs inside Scriptable on iPhone.
2. Requests bootstrap data from Google Apps Script.
3. Builds the UI as HTML/CSS/JavaScript inside a Scriptable WebView.
4. Uses a custom URL scheme:
   `pakshi-action://`
5. Sends user mutations from the WebView back to Scriptable.
6. Scriptable calls the Apps Script backend.
7. Scriptable refreshes bootstrap data after writes.
8. The WebView is updated from the refreshed data.

## Backend

Backend source:

`backend/google-apps-script.js`

It is deployed as a Google Apps Script Web App.

The backend uses Google Sheets as the database.

Current sheets/data domains:

- Members
- Categories
- Expenses
- Income
- Savings
- Budgets

## Security status

This is a prototype backend.

The Google Sheet is configured to allow broad access and there is no production authentication/authorization boundary.

Therefore:

**This architecture is not production-safe and must not be treated as the final backend.**

---

# 3. Current UI/features

The V6 prototype currently contains:

## Home

- Current month
- Household income
- Savings
- Expenses
- Monthly budget
- Remaining budget
- Spending percentage
- Spending by category
- Category progress bars

## Add Expense

Fields:

- Amount
- Date
- Category
- Description
- Payment method
- Paid by
- Notes

## Expenses

- Monthly expense list
- Sort by:
  - Newest
  - Oldest
  - Highest
  - Lowest
- Open individual expense
- Edit expense
- Delete expense

## Category views

- Category list
- Category totals
- Category transaction list
- Same four transaction sort options:
  - Newest
  - Oldest
  - Highest
  - Lowest

## Income

- Current-month income
- First member income
- Second member income
- Edit/save flow

## Savings

- First member account
- Second member account
- Common account

## Budget

- Monthly household budget
- Individual category budgets
- Budget progress

## Settings

- Household member names
- Default payment method
- CSV export
- About section

---

# 4. Default categories

The current fallback category set is:

| ID | Name |
|---|---|
| food | Food & Dining |
| groceries | Groceries |
| shopping | Shopping |
| travel | Travel |
| transport | Transport |
| bills | Bills |
| entertainment | Entertainment |
| health | Health |
| home | Home |
| other | Other |

The frontend also contains fallback members:

- member-1 / Husband / first
- member-2 / Wife / second

These are prototype defaults, not the final household identity model.

---

# 5. Important implementation behavior

## Bootstrap

The frontend requests:

`action=bootstrap`

The backend returns:

- members
- categories
- non-deleted expenses
- income
- savings
- budgets

The frontend normalizes the response before rendering.

## Expense verification

Expense creation has an explicit verification pattern:

1. Generate an expense ID.
2. Attempt the write.
3. Refresh bootstrap data.
4. Verify the generated ID exists.
5. Only then show "Expense saved".

This was added because an Apps Script write can complete even when the client experiences a transport/redirect failure.

This is an important lesson for the prototype.

## Income verification

As of Checkpoint 2, Save Income has been upgraded to use the same principle.

Current flow:

1. Attempt the current GET mutation transport.
2. Refresh bootstrap data.
3. Check whether the requested month/amounts actually exist.
4. If not verified, attempt a real POST using explicit redirect handling.
5. Refresh again.
6. Verify the saved values.
7. Only show "Income saved" if the backend data matches.

Latest commit implementing this:

`97029762101b95a38dce4d41000258b7f9a8a559`

Commit message:

`fix: verify income writes across transport failures`

---

# 6. Transport investigation — important historical knowledge

This is one of the most important parts of the project.

## Original problem

Scriptable POST requests to the Google Apps Script Web App were unreliable.

Symptoms included:

- invalid JSON
- Google Drive/Apps Script HTML returned instead of JSON
- redirect-related behavior
- writes sometimes appearing to work while the client reported failure
- Safari opening the same endpoint successfully

At one point the client reported:

```
Backend returned invalid JSON:
<!DOCTYPE html>...
```

The HTML was a Google/Apps Script page rather than the expected JSON response.

## Safari test

The exact Web App endpoint was opened manually in Safari.

Safari successfully reached the deployed endpoint and eventually displayed JSON.

This established:

**The backend deployment was reachable.**

It did not establish that Scriptable's POST transport was reliable.

The Safari request also showed that the endpoint could take a significant amount of time to respond.

## Important conclusion

Do not assume:

> "The URL works in Safari, therefore Scriptable POST works."

Those are separate transport paths.

---

# 7. GET mutation transport

Because POST response handling was unreliable in Scriptable, the prototype backend was extended to support URL-encoded GET mutations.

The intended format is conceptually:

```
?action=saveIncome&payload=<URL-encoded JSON>
```

Apps Script `doGet()` parses the payload and routes it into the same mutation logic.

The client was changed so that mutation call sites still identify operations as POST conceptually, but the actual transport uses GET.

This allowed the prototype to avoid the problematic POST response/redirect path.

## Current limitation

The deployed Apps Script version may not always match the latest source in GitHub.

Therefore, when a client/backend discrepancy appears, distinguish between:

1. code currently committed in GitHub
2. code actually deployed in Apps Script
3. behavior observed from Scriptable
4. behavior observed from Safari

Never assume these are identical.

---

# 8. Save Income incident

Save Income initially failed with:

```
Backend error invalid JSON
```

Investigation showed:

- frontend Save Income call was routed through the mutation transport
- backend source supports GET mutation payloads
- bootstrap GET worked
- Safari could open the endpoint
- the failure was specifically around the mutation request/response path

The latest fix therefore avoids trusting the mutation response alone.

It uses **write + refresh + verification**, with a POST fallback.

This is now the standard pattern we should prefer for prototype writes where transport reliability is uncertain.

---

# 9. Sorting feature

The user requested transaction sorting.

Decision:

Four options:

1. Newest
2. Oldest
3. Highest
4. Lowest

Sorting was implemented first for the main Expenses screen and then for Category Detail.

There was an initial bug where tapping the sort button changed the state but did not visibly refresh the active list.

The event handler was corrected to rerender the active screen:

- category-detail → `renderCategoryDetail()`
- expenses-detail → `renderExpenses()`

The user manually tested this and confirmed:

**Sorting works.**

Relevant commits included:

- `dd144aa...` — add expense transaction sort options
- `33c0750...` — add sorting to category transactions
- `0b3c06d...` — refresh active transaction list after sorting

---

# 10. Major regression and restoration

A major regression occurred during development.

Symptoms included:

- categories missing from Add Expense dropdown
- Budget screen empty
- other previously working functionality disappearing

The current V6 source was compared against a known-good historical commit:

`9c1c6af096854455c9a64a16b1d6472c49539679`

The known-good application state was restored.

Restoration commit:

`fcecd6b70a0dce8efa66b13fc9a8383a6a741d9d`

Commit message:

`fix: restore known-good Scriptable app build`

Important lesson:

**Do not rewrite the prototype wholesale when making a feature change.**

Use Git history to identify the last known-good state and make the smallest possible change.

---

# 11. Known Git history / milestones

Important commits in chronological development history include:

### Restore

`fcecd6b...`

`fix: restore known-good Scriptable app build`

Restored V6 after a regression.

### Sorting

`dd144aa...`

`feat: add expense transaction sort options`

Added sorting to Expenses.

`33c0750...`

`feat: add sorting to category transactions`

Added sorting to Category Detail.

`0b3c06d...`

`fix: refresh active transaction list after sorting`

Fixed sorting UI refresh.

### Transport

`7c98de0...`

`fix: preserve native GET redirect handling`

Restored normal GET redirect handling after bootstrap behavior was affected.

`b235eca...`

`fix: use GET transport for all Scriptable mutations`

Moved prototype mutations onto the GET transport.

### Current

`9702976...`

`fix: verify income writes across transport failures`

Added Save Income verification and POST fallback.

---

# 12. Tests performed

The following are known manual tests/investigations performed during this project.

## App launch

Tested the Scriptable app after transport changes.

Result:

**Passed.**

The app opened normally after the GET redirect handling fix.

## Bootstrap

The app successfully retrieved backend data and rendered the main UI.

Result:

**Passed.**

## Categories

Tested after a major regression.

The category dropdown had previously disappeared.

After restoration from the known-good V6 state:

**Categories restored.**

## Budget

Budget rendering had previously disappeared during the regression.

After restoration:

**Budget functionality restored.**

## Expense creation

The prototype contains a write-and-refresh verification mechanism.

The flow was specifically designed to account for transport responses that can be unreliable even when the write reaches Sheets.

## Sorting

Tested:

- Newest
- Oldest
- Highest
- Lowest

Tested on:

- Expenses
- Category Detail

Result:

**Passed.**

The user explicitly confirmed sorting works.

## Backend endpoint in Safari

Opened the deployed Apps Script endpoint directly in Safari.

Result:

**Endpoint reachable and JSON response observed.**

This was an important diagnostic test because Scriptable was receiving HTML in some mutation cases.

## Scriptable mutation transport

Tested and investigated both:

- POST
- GET

Conclusion:

**GET is currently the preferred prototype mutation transport because POST response/redirect behavior is unreliable on iOS/Scriptable.**

## Save Income

Current status at the time of this checkpoint:

A previous Save Income implementation returned:

`Backend error invalid JSON`

A new write/verify/fallback implementation has just been committed.

**Manual retest is still required.**

---

# 13. Known performance characteristics

The prototype has experienced slow backend responses.

In particular:

- Expense saves have previously taken approximately 8–10 seconds.
- Opening the endpoint manually in Safari could also take roughly 10–12 seconds in observed tests.

The exact cause has not been formally measured.

Potential contributing factors include:

- Apps Script execution latency
- Google Sheets read/write operations
- ContentService response redirects
- Scriptable networking behavior
- repeated full-sheet bootstrap reads

Do not optimize based on speculation.

If performance becomes a priority, measure:

1. request start
2. Apps Script execution
3. Sheets reads
4. Sheets writes
5. response generation
6. Scriptable response receipt

before redesigning the backend.

---

# 14. Important prototype limitations

The following are known and accepted for this stage:

## Google Sheets is the database

This is convenient for prototyping but unsuitable as the production data layer.

## No production authentication

The prototype does not have the native Supabase household authentication/RLS model.

## Broad backend access

The prototype backend is not suitable for sensitive real-world financial data.

## Full bootstrap reads

The app generally refreshes the dataset after mutations.

This is simple and useful for the prototype but will not necessarily be the optimal production synchronization model.

## Apps Script transport quirks

The prototype is intentionally carrying workarounds for Google Apps Script + Scriptable behavior.

These workarounds should not be blindly copied into the native app.

---

# 15. Architectural lessons learned

## Lesson 1 — Separate product behavior from transport

The UI should not assume that a successful HTTP response means the data was persisted.

For this prototype:

```
write
  ↓
refresh
  ↓
verify actual backend state
```

is more trustworthy.

## Lesson 2 — Google Apps Script is useful for prototyping, not the final backend

It gave us a very fast way to create a working backend without building infrastructure.

But its:

- redirect behavior
- latency
- authentication limitations
- Sheets-backed storage

make it inappropriate as the final architecture.

## Lesson 3 — Git history is essential

The V6 regression demonstrated that the ability to return to a known-good commit is not optional.

Every meaningful change should have a focused commit.

## Lesson 4 — Keep prototype and production separate

Scriptable is helping us discover what the product should be.

The native iOS/Supabase app is where the production architecture belongs.

## Lesson 5 — Do not trust a browser test as proof of Scriptable behavior

Safari and Scriptable may handle the same Apps Script endpoint differently.

Both need to be tested independently.

---

# 16. Current source of truth

For Scriptable:

**GitHub repository**

`paaras03/pakshi-expenses-scriptable`

Important files:

```
src/pakshi-v6.js
backend/google-apps-script.js
```

The GitHub repository is the source of truth for the prototype.

Do not use an old copied V6 file from a previous chat as the authoritative version.

---

# 17. Current status

### Working

- App launches
- Bootstrap data loads
- Home dashboard
- Categories
- Add Expense UI
- Expenses
- Expense editing/deletion paths
- Budget UI
- Income UI
- Savings UI
- Settings
- CSV export path
- Category detail
- Expense sorting
- Category transaction sorting
- GET mutation transport
- Expense write verification
- Git history / rollback points

### Recently fixed

- Major V6 regression
- GET redirect/bootstrap behavior
- Expense/category sorting refresh
- Save Income transport handling

### Needs immediate verification

- Save Income after commit `9702976`

### Not yet production-ready

- Authentication
- Authorization
- Secure backend
- Production database
- Production sync architecture
- App Store hardening

---

# 18. What should happen next

The next manual test is deliberately narrow:

**Test Save Income only.**

If it passes:

1. Test Savings.
2. Test Budget.
3. Test Members.
4. Test Expense create/edit/delete.
5. Do a short end-to-end regression pass.
6. Freeze the Scriptable prototype.
7. Capture final product/spec decisions.
8. Return focus to the native SwiftUI/Supabase app.

If Save Income still fails, do **not** make another blind frontend change.

Instead inspect the exact deployed Apps Script behavior and reconcile:

- GitHub backend source
- deployed Apps Script version
- actual request URL
- returned response
- Sheet state

---

# 19. Product strategy decision

The Scriptable prototype should not become the permanent application.

The intended sequence is:

```
Validate product in Scriptable
        ↓
Stabilize prototype
        ↓
Document what was learned
        ↓
Freeze prototype
        ↓
Build native SwiftUI/Supabase product
        ↓
Use native app daily
        ↓
Production hardening
        ↓
Ship
```

The key principle is:

> Scriptable teaches us what to build. SwiftUI + Supabase is what we ultimately build.

---

# 20. Handoff instruction for the next development session

Treat this checkpoint as the authoritative Scriptable handoff.

Before making a change:

1. Read this checkpoint.
2. Read `src/pakshi-v6.js`.
3. Read `backend/google-apps-script.js` when the change touches backend behavior.
4. Preserve existing working functionality.
5. Make the smallest change that solves the problem.
6. Commit every meaningful change.
7. Test the specific changed behavior before moving to another feature.
8. Never assume the deployed Apps Script matches the GitHub backend source.
9. Keep the Scriptable and native iOS projects separate.
10. When the prototype is stable, stop adding features and move the validated behavior into the native app.
