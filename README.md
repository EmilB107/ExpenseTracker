# Expense Tracker

A modern expense tracking application built with Vue 3, Vite, and Tailwind CSS.

## Features

- Add Expenses - Input date, description, and amount with form validation
- Search Functionality - Filter expenses by description
- Main Table - View all expenses sorted by date (descending) with striped rows
- Weekly Totals - Aggregate expenses by week with ISO 8601 week numbers
- Local Storage - Automatic persistence of all expense data
- Responsive Design - Mobile-friendly layout that works across all devices
- Confirmation Modal - Verify expense details before saving
- Date Picker - Professional calendar widget with date restrictions

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

The application will be available at `http://localhost:5173`

To expose the server to your local network (e.g., for mobile testing):

```terminal
npm run dev -- --host
```

## Tech Stack

- Vue 3 (^3.5.22) - Progressive JavaScript framework with Composition API
- Vite (^7.1.7) - Next generation frontend tooling
- Tailwind CSS (^4.1.14) - Utility-first CSS framework
- @vuepic/vue-datepicker (^11.0.3) - Professional date picker component
- @heroicons/vue (^2.2.0) - Beautiful hand-crafted SVG icons

## Project Structure

```
ExpenseTracker/
├── public/                         # Static assets
├── src/
│   ├── assets/
│   │   └── style.css               # Global styles and Tailwind imports
│   ├── components/
│   │   ├── MainTable.vue           # Main expense table with search
│   │   ├── WeeklyTable.vue         # Weekly aggregation view
│   │   ├── ExpensesForm.vue        # Add expense form with date picker
│   │   └── ConfirmationModal.vue   # Expense confirmation dialog
│   ├── composable/
│   │   ├── useStorage.js           # LocalStorage persistence layer
│   │   ├── useMainLogic.js         # Main table business logic
│   │   ├── useWeeklyLogic.js       # Weekly aggregation calculations
│   │   └── useFormLogic.js         # Form validation and submission
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

## Key Features Explained

### Main Table
- Displays all expenses sorted by date (latest first)
- Search functionality filters by description in real-time
- Striped rows for better readability
- Responsive column widths with truncated descriptions
- Custom dark scrollbar styling

### Weekly Aggregation
- ISO 8601 week number calculation (Week 1 contains first Thursday)
- Year selector dropdown with dark theme
- Shows only weeks with expenses
- Hover tooltips display date ranges (Monday-Sunday)
- Yearly total calculation

### Add Expense Form
- Date picker with max-date restriction (cannot select future dates)
- Form validation (all fields required, positive amounts only)
- Confirmation modal before saving with expense preview
- Auto-reset form after submission
- Autofill-friendly dark theme styling
- Responsive button sizing for mobile devices

### Data Persistence
- Automatic localStorage synchronization with deep watcher
- Default sample data on first load
- Computed sorting for consistent descending date order
- Reactive updates across all components