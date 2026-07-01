# Demo Walkthrough

## 1-Minute Version

1. Open `/submission-live`.
2. Show runtime status: Stripe configured, Hermes provider, latest run ID, proof metrics.
3. Click **Run Live Test Demo**.
4. Explain: CEO/Growth/Ops/Learning may use Hermes/Nemotron; CFO/Risk/Audit are deterministic.
5. Open `/stripe-revenue` and show the Stripe Checkout Session.
6. Open `/profit-loss`: revenue, cost, blocked risk, and profit come from Prisma.
7. Open `/audit`: receipts and policy decisions prove what happened.

## 3-Minute Version

1. Start at `/agents`: explain goal, budget, success condition, runtime mode, and tool permissions.
2. Open `/mission`: submit the Web3 founder research-report goal with `$25` budget.
3. Open `/operations`: show CEO plan, CFO policy, Growth copy, Stripe checkout, Ops fulfillment, spend requests, Risk veto, Audit record, and Learning recommendation.
4. Open Stripe Checkout and pay with test card `4242 4242 4242 4242`.
5. Confirm `/orders` shows paid or checkout-created order depending on webhook timing.
6. Open `/budget-firewall`: `$6` data spend approves, `$9` lead spend needs approval, `$60` infra spend blocks.
7. Open `/approvals`: approve or reject the pending spend and show P&L changes.
8. End at `/submission-live`: the judge can see real IDs, receipts count, blocked spend, profit, and provider status.

## What Is Real

- Real Stripe test-mode Checkout Sessions when Stripe keys are configured.
- Real webhook reconciliation when Stripe CLI/webhook secret is configured.
- Real local Hermes OpenAI-compatible calls when NemoHermes is connected.
- Real Prisma-backed dashboards.

## What Is Fallback

- `DEMO_MODE=true` uses explicit demo paths.
- If a creative Hermes step times out, the run continues with visible deterministic fallback content. Spend approval, risk blocking, audit, and P&L never rely on LLM output.