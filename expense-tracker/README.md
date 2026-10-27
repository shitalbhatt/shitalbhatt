# Expense Tracker

A small personal expense tracker. Everything runs in the browser and is stored in
`localStorage`, so there is no backend, no account and no API key.

## Run it

```bash
cd expense-tracker
npm install && npm run dev
```

Open the URL Vite prints (http://localhost:5173). The dev server also listens on your
LAN, so you can open it on a phone. `npm run build` type-checks and produces a static
`dist/`.

## Features

- Add, edit and delete expenses (amount, description, category, date)
- Month navigator with the month's total and a per-category breakdown
- Search by description and filter by category
- Expenses grouped by day, newest first
- Export all expenses to CSV
- Data persists across reloads; corrupted storage falls back to an empty list
- Mobile-first layout, automatic light/dark theme

## Stack

React 18 + Vite + TypeScript. Runtime dependencies: `react`, `react-dom` only.

```
src/
  App.tsx          main screen: summary, filters, list
  ExpenseForm.tsx  add/edit form with validation
  lib.ts           storage, money parsing/formatting, date + CSV helpers
  types.ts         Expense type and category list
```

## Assumptions

The app description and stack in the request were left as placeholders, so I used the
examples given there (personal expense tracker; React + Vite + TypeScript; localStorage).

- Lives in `expense-tracker/` because the repo root already holds an unrelated static site.
- Single currency, USD, formatted with the browser locale.
- Amounts are stored as integer cents and limited to 2 decimals.
- Fixed category list (see `src/types.ts`); no custom categories yet.
- Data is per browser/device. Clearing site data erases it, so use Export CSV to back up.
- Deleting asks for confirmation via the browser's `confirm()` dialog.

## Testing

Tested manually in headless Chromium at a 375px-wide viewport: validation errors,
add/edit/delete, totals (including cents rounding), search, category filter, month
navigation, persistence across reload, corrupted storage and no horizontal overflow.
There is no automated test suite in the repo yet.

## Next ideas

- Monthly budgets with over-budget warnings
- Custom categories and a currency setting
- CSV/JSON import, so backups can be restored
- Recurring expenses
- Charts over several months
- Automated tests (Vitest for `lib.ts`, Playwright for the flows above)
- PWA/offline install support
