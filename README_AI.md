# Web Admin (new-exdollarium) — README for AI

Purpose
- React (CRA) admin UI for managing trade confirmations, funding flows, and viewing transaction history.

Entry points
- `src/index.js` / `src/index.css` — app bootstrap (CRA)
- Important components:
  - `src/components/ReceiptModal.js` — generic receipt renderer used across the app
  - `src/components/TradeHistory.js` — user transaction history and receipt building
  - `src/pages/TradeTransactions.js` — admin list and funding UI

Run & env
- Start: `npm start`
- Required env: `REACT_APP_API_URL` (backend API)

Notes for AI
- When adjusting UI strings or receipts, change only labels and preserve `copyable` flags to keep clipboard behavior.
- Avoid shipping secrets or changing build tooling; provide optional suggestions for migrating inline hex colors to CSS variables.

Design tokens
- The notifier app contains centralized tokens in `exdollarium-notifier/src/styles/tokens.ts`. Consider consolidating web tokens in `src/styles` for parity.

Suggested tasks for agent
- Replace a conservative set of inline hex colors with CSS variables and add the variables to `src/index.css`.
- Ensure receipt modal continues to accept `receiptData.fields` (array of {label, value, copyable}).