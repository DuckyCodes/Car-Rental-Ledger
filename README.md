# Rental Ledger — local rental fleet expense tracker

A local-first manual-entry app for tracking multiple rental vehicles, rental bookings, expenses and receipts, market valuations, depreciation estimates, monthly cash flow, and rental-level profitability.

## Requirements
- Node.js 20 or newer (Node 22 LTS recommended)
- npm

## Start on Windows
1. Extract this folder somewhere convenient.
2. Open PowerShell in the `rental-ledger` folder.
3. Run `npm install` (first time only).
4. Run `npm run dev`.
5. Open **http://127.0.0.1:5173** in your browser.

The frontend runs on port 5173 and the local Express API/database runs on port 8787. Keep the terminal open while using the app. Stop it with Ctrl+C.

## Start on macOS / Linux
Same commands in Terminal:
```bash
npm install
npm run dev
```

## Where data lives
- SQLite database: `data/rental-ledger.sqlite`
- Receipt files: `data/receipts/`
- Keep both in backups. The app's **Data & backups** screen exports a JSON record backup; receipt files need to be copied separately from `data/receipts`.

## Features
- Multiple vehicle records with mileage-based or age-based declining-balance depreciation assumptions
- Rental records with dates, daily rate, included km, extra-km rate, odometer start/end and other revenue
- Direct and Turo booking inputs, including discounts, Turo fees, on-trip charging, and other platform fees
- Expenses linked to a vehicle and optionally a specific rental
- Receipt uploads (PDF, JPG, PNG, WEBP; max 10 MB each)
- Distinguishes operating costs, loan principal cash outflows, and capital items
- Dashboard for revenue, costs, estimated profit and cash flow
- Expense filtering and CSV export
- Market valuation history and odometer snapshots
- JSON export and restore for records

## Calculation notes / assumptions
- Rental revenue = Turo gross trip income when provided, otherwise daily rental income × number of rental calendar days (inclusive) + extra-km charges + additional extra-km income + damage fees + admin fees + cleaning fees + other vehicle income. Turo fee, GST, provincial tax, discount, and charging reimbursement fields are retained for reference only and are excluded from totals because they are already included in gross income. Security deposits are tracked separately and are not treated as revenue unless retained.
- The damage/scratch/admin fees field is a simple vehicle-linked income bucket; use the separate extra-km charge field for mileage charges.
- Rental distance = end odometer − start odometer, floored at zero.
- Rental-level mileage depreciation estimate = rental km × that vehicle's depreciation-per-km assumption. Total vehicle mileage depreciation uses total vehicle km, including recorded rental km, for a conservative estimate.
- Declining-balance depreciation estimate = the vehicle's value at the start of the rental minus its value at the end, using the annual decline rate, purchase date, purchase price, and residual value. This is allocated by rental days and is intended as a management estimate.
- Estimated profit = rental revenue − recorded expenses except loan principal − estimated mileage depreciation. This is a management estimate and does not allocate all fixed monthly costs to individual rentals. For rental-level results, link relevant expenses to the rental.
- Cash flow = rental revenue − all recorded cash expenses, including loan principal.
- Expenses can be marked as recurring monthly expenses; recurring insurance, finance, registration, storage, and similar costs are included in each later monthly bottom-line calculation.
- Insurance can be configured per vehicle as a personal monthly baseline plus a commercial daily rate. On rental days, the commercial daily rate replaces the personal daily share; it is not added on top, preventing double counting.
- Turo fee, tax, discount, and charging reimbursement fields are not added to operating costs or deducted from gross trip income; they are reference-only fields.
- Financing: the full loan payment affects cash flow. Principal is not an operating expense in the dashboard's profit estimate; record interest separately as an operating expense.
- Capital items are kept separate from operating costs but are not currently depreciated as accounting capital assets. Market valuation entries are tracked separately and do not automatically override the selected depreciation model.
- Dashboard monthly rental revenue groups bookings by start month in the six-month trend; the selected-period overview includes rentals overlapping the selected month. Treat the reports as management estimates, not tax advice or a formal accounting statement.

## Local privacy
The server binds to `127.0.0.1`, so it is intended for use on this computer and is not exposed to your local network. No login or cloud sync is included. Protect your Windows/macOS account and backups, and do not delete the `data` folder if you want to preserve your records.

## Build production bundle
```bash
npm run build
npm start
```
Then open `http://127.0.0.1:8787`.
