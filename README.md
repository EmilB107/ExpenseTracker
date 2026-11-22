# Expense Tracker

A modern expense tracking application built with Vue 3, Vite, and Tailwind CSS.

Originally built as an internship technical assessment, now repurposed for personal use.

Live app: https://emilb107.github.io/ExpenseTracker/

## Features

- Add, Edit, and Delete Expenses - Input date, description, and amount with form validation
- Search Functionality - Filter expenses by description
- Main Table - View all expenses sorted by date (descending) with striped rows
- Weekly Totals - Aggregate expenses by week with ISO 8601 week numbers
- Local Storage - Works offline out of the box, with data saved in your browser
- Google Drive Sync (optional) - Sync expenses across devices using your own Google Drive
- Responsive Design - Mobile-friendly layout that works across all devices
- Modal Forms - Add, edit, and confirm expenses without leaving the table
- Date Picker - Calendar widget that blocks future dates

## Prerequisites

- Node.js (version ^20.19.0 or >=22.12.0)
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:

```terminal
npm install
```

## Development

Run the development server:

```terminal
npm run dev
```

The application will be available at `http://localhost:5173/ExpenseTracker/`

To expose the server to your local network (e.g., for mobile testing):

```terminal
npm run dev -- --host
```

## Google Drive Sync

Sync is optional. Without it, expenses are saved in your browser's localStorage only.

When you sign in, expenses are saved to a hidden app folder in **your own** Google Drive. Requests go straight from your browser to Google, so there's no backend and nobody else, including the developer, can see your data.

### Using your own client ID

Click the cloud icon next to the "Expense Tracker" title. The modal walks you through creating a free Google Cloud OAuth client ID step by step, with no credit card needed. Paste the client ID into the modal and it's stored in your browser. OAuth client IDs aren't secret, but never use the client secret, since this app doesn't need it.

### How syncing works

- On sign-in, the app downloads `expenses.json` from your Drive's app folder
- Before every add, edit, or delete, it downloads the latest copy first, so an outdated tab or device can't overwrite newer data
- Switching back to the tab reloads the latest data from Drive
- Signing out keeps a copy in the browser. Anything added, edited, or deleted while signed out is uploaded on the next sign-in
- Google sign-in tokens last about an hour. When one expires, the app renews it automatically on your next add, edit, or delete. Opening the app after the hour needs one click on Reconnect to load your data, since browsers only allow Google's popup after a click

## Tech Stack

- Vue 3 (^3.5.22) - Progressive JavaScript framework with Composition API
- Vite (^7.1.7) - Next generation frontend tooling
- Tailwind CSS (^4.1.14) - Utility-first CSS framework
- @vuepic/vue-datepicker (^11.0.3) - Date picker component
- @heroicons/vue (^2.2.0) - SVG icons
- Google Identity Services + Google Drive API - Optional sign-in and sync

## Project Structure

```
ExpenseTracker/
├── .github/workflows/deploy.yml    # Builds and deploys to GitHub Pages
├── public/                         # Static assets
├── src/
│   ├── assets/
│   │   └── style.css               # Global styles, Tailwind import, modal transitions
│   ├── components/
│   │   ├── MainTable.vue           # Layout shell: header, search, expense table
│   │   ├── WeeklyTable.vue         # Weekly aggregation view
│   │   ├── ExpensesForm.vue        # Add/edit expense modal with confirmation step
│   │   ├── DeleteExpenseModal.vue  # Delete confirmation dialog
│   │   ├── RowActionsMenu.vue      # Per-row "⋯" menu with Edit and Delete
│   │   ├── SyncStatus.vue          # Storage/sync status shown in the header
│   │   └── SyncSettingsModal.vue   # Google Drive setup guide and client ID field
│   ├── composable/
│   │   ├── useStorage.js           # Data source: localStorage or Google Drive
│   │   ├── useMainLogic.js         # Search, modals, and table UI state
│   │   ├── useWeeklyLogic.js       # Weekly aggregation calculations
│   │   └── useFormLogic.js         # Form validation and submission
│   ├── utils/
│   │   ├── currency.js             # Peso currency formatting
│   │   └── googleDrive.js          # Google sign-in and Drive API requests
│   ├── App.vue                     # Root component
│   └── main.js                     # Application entry point
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
└── README.md                       # Project documentation
```

## Architecture

This project follows a composable-based architecture for better code organization:

- Components - Thin UI layers that handle presentation only
- Composables - Reusable business logic with dependency injection
- Separation of Concerns - Logic separated from UI for testability
- Reactive Data Flow - Vue 3 Composition API with refs and computed properties

`useStorage` is the single source of truth for expense data. The rest of the app only calls `addExpense`, `updateExpense`, and `deleteExpense`, and doesn't know whether data lives in localStorage or Google Drive.

## Key Features Explained

### Main Table
- Displays all expenses sorted by date (latest first)
- Search functionality filters by description in real-time
- Striped rows for better readability
- "⋯" menu on each row to edit or delete an expense
- Responsive column widths with truncated descriptions
- Custom dark scrollbar styling

### Weekly Aggregation
- ISO 8601 week number calculation (Week 1 contains first Thursday)
- Year selector dropdown with dark theme
- Shows only weeks with expenses
- Hover tooltips display date ranges (Monday-Sunday)
- Yearly total calculation
- Empty state when there are no expenses yet

### Add and Edit Expense Form
- Opens as a modal over the table, so search and scroll position are kept
- Date picker with max-date restriction (cannot select future dates)
- Form validation (all fields required, positive amounts only)
- Confirmation step before saving, with a Back button that keeps your input
- Save is disabled when editing until something actually changes
- Autofill-friendly dark theme styling

### Delete
- Confirmation dialog showing the expense details before deleting

### Data Persistence
- localStorage by default, clearly labeled "Saved in this browser only"
- Optional Google Drive sync (see [Google Drive Sync](#google-drive-sync))
- Computed sorting for consistent descending date order
- Reactive updates across all components
