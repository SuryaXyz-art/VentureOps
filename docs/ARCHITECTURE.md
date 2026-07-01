# Architecture

VentureOps Autopilot is an agentic business control tower. A founder submits one business goal and one operating budget; the system creates a persisted `BusinessRun`, coordinates specialist agents, opens a Stripe test-mode checkout, records spend decisions, generates fulfillment proof, and publishes a P&L audit trail.

## Runtime Layers

1. **Next.js App Router UI**: judge demo, mission control, agent management, Stripe revenue, orders, audit, P&L, operations, approvals, and submission proof.
2. **API Routes**: JSON endpoints under `/api/*` for runs, orders, receipts, P&L, runtime status, Stripe, LLM smoke tests, approvals, and report generation.
3. **Prisma + SQLite**: source of truth for `BusinessRun`, `AgentEvent`, `CustomerOrder`, `SpendRequest`, `PolicyDecision`, `Receipt`, `StripeEvent`, `FulfillmentReport`, and `ProfitLossReport`.
4. **Agent Engine**: CEO, Growth, Ops, and Learning agents may call Hermes/Nemotron for creative planning. CFO, Spend, Risk, Audit, and policy evaluation are deterministic.
5. **Stripe Test Mode**: creates/reuses products and prices, creates Checkout Sessions, and reconciles `checkout.session.completed` webhooks.
6. **Safe Runtime Boundary**: documented NemoClaw/OpenShell-style controls in `nvidia/`, including credential isolation, network allowlists, policy-gated spend, and auditable receipts.
7. **MCP Stdio Server**: `scripts/mcp-server.mjs` exposes safe app-level tools without exposing secrets.

## Agent Execution Workflow

```text
Goal + Budget
  -> CEO Agent: business plan and success metric
  -> CFO Agent: deterministic budget policy
  -> Growth Agent: landing copy and launch material
  -> Stripe Agent: test-mode checkout session/order
  -> Ops Agent: generated customer report
  -> Spend Agent: proposed tool/data spends
  -> Risk Agent: deterministic policy decisions
  -> Audit Agent: receipts and event log
  -> Learning Agent: next experiment recommendation
  -> P&L: revenue, cost, profit, blocked risk
```

## Data Workflow

All judge-facing dashboards read from Prisma-backed APIs. Demo data is only used when `DEMO_MODE=true` or explicit demo routes are selected. In live test mode, missing Stripe/Hermes configuration produces visible errors or clearly labeled fallback content rather than fake success.

## Payment Workflow

Stripe Checkout is created through `/api/stripe/create-checkout`. The webhook route verifies signatures when `DEMO_MODE=false`, upserts the Stripe event, updates the matching `CustomerOrder` to `paid`, records a receipt, writes a Stripe `AgentEvent`, and updates the P&L report.