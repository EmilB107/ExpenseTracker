# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5173/ExpenseTracker/
npm run dev -- --host  # Expose to local network (for mobile testing)
npm run build      # Production build to ./dist
npm run preview    # Preview production build locally
```

No test runner is configured in this project.

## Architecture

This is a Vue 3 + Vite + Tailwind CSS 4 SPA deployed to GitHub Pages at `/ExpenseTracker/` (set via `base` in `vite.config.js`).

### Data flow

`useStorage` is the single source of truth. It owns `expensesRaw` (a `ref` array persisted to `localStorage` under the key `expense-tracker-data`) and exposes a computed `expenses` that returns entries sorted by date descending. All other composables receive `expenses` as a prop — they never touch storage directly.

```
useStorage (owns data + persistence)
    └── expenses (computed, sorted) ──► useMainLogic (search, UI state)
                                    └── useWeeklyLogic (ISO week aggregation)
    └── addExpense ──────────────────► useFormLogic (form state + validation)
```

`MainTable.vue` is the only component instantiated by `App.vue`. It acts as the layout shell, wiring the composables together and conditionally rendering `ExpensesForm` (full-screen replacement) or the table + optional `WeeklyTable`.

### Composables

| File | Responsibility |
|---|---|
| `useStorage.js` | Load/save expenses from `localStorage`; expose sorted `expenses` computed and `addExpense` |
| `useMainLogic.js` | Search query, show/hide state for form and weekly table, filtered/total computed, `formatCurrency` |
| `useWeeklyLogic.js` | ISO 8601 week number calculation, year selector, `weeklyTotals` and `yearlyTotal` computed |
| `useFormLogic.js` | Form field state, validation errors, confirmation modal state, date formatting, submit/cancel handlers |

### Date formats

Dates are stored in `localStorage` as `MM/DD/YYYY`. The form internally uses `YYYY-MM-DD` (bound to the date picker) and converts to `MM/DD/YYYY` on confirm. `useWeeklyLogic` parses dates with `new Date(expense.date)` which relies on this format being unambiguous in the browser.

### Styling

Tailwind CSS 4 is integrated via the `@tailwindcss/vite` plugin (not PostCSS). Custom dark table row colors (`table-color`, `table-color2`) and scrollbar styles are defined in `src/assets/style.css`. Currency is formatted with a Philippine Peso sign (`₱`).

### Deployment

Pushing to `master` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`) which runs `npm ci && npm run build` and deploys `./dist` to GitHub Pages.
