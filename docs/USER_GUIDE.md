# User Guide

## 1. Check Runtime Mode

Open `/submission-live` or `/agents`. Confirm the badges show either:

- `Live test mode`: Stripe/Hermes configuration is expected.
- `Explicit demo mode`: deterministic fallback mode for offline judging.

## 2. Create Or Manage An Agent Run

Open `/mission` or `/agents`.

Enter:

- Business goal
- Operating budget
- Business type
- Shadow/live test mode

Click the run button. The app creates a persisted `BusinessRun` and records agent events as each step executes.

## 3. Review Budget And Safety

Open `/budget-firewall` and `/approvals`.

The firewall shows:

- Approved low-risk spend
- Needs-founder-approval spend
- Blocked high-risk spend
- Remaining budget
- Matched policy rules

Approving or rejecting a pending spend updates P&L and audit receipts.

## 4. Create Revenue

Open `/stripe-revenue` and create or open a Stripe test checkout. Pay with Stripe test card `4242 4242 4242 4242` and any future expiry/CVC.

Keep Stripe CLI running for webhook reconciliation:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 5. Check Fulfillment

Open `/orders`. Paid orders show report links when fulfillment has generated a report.

## 6. Read Proof And Logs

Open:

- `/operations` for event stream
- `/audit` for receipts and policy decisions
- `/profit-loss` for revenue, costs, profit, blocked risk, and margin
- `/submission-live` for judge proof summary

## 7. Export Proof

Use export buttons on audit/proof pages to copy or download the JSON record for the latest run.