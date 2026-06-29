# VentureOps Autopilot

VentureOps Autopilot is an **Agentic Business Control Tower** for the Hermes Agent Accelerated Business Hackathon. A founder gives one business goal and one budget; specialist agents plan the business, create Stripe test-mode revenue, generate a customer report, request spend, route risky spend to approval, block unsafe spend, record receipts, and produce a Prisma-backed P&L audit.

One-line pitch: **Launch. Earn. Spend. Fulfill. Audit. All by autonomous agents, controlled by a budget firewall.**

## What Is Real

- Stripe uses real **test-mode** products, prices, Checkout Sessions, and webhook reconciliation when Stripe keys are configured.
- Hermes runs through a local OpenAI-compatible endpoint and can use **Nemotron 3 Ultra** when configured.
- Prisma + SQLite are the source of truth for runs, orders, receipts, Stripe events, spend requests, policy decisions, reports, and P&L.
- `DEMO_MODE=true` is only a backup/demo path. `DEMO_MODE=false` shows configuration errors instead of fake success.

## Architecture

```text
Founder Goal + Budget
        |
        v
CEO/Growth/Ops/Learning -> Hermes local API -> Nemotron 3 Ultra
        |
        v
CFO Policy + Spend Agent + Risk Engine -> deterministic budget firewall
        |
        +--> Stripe Checkout test mode -> webhook -> Prisma orders/revenue
        |
        +--> Approval Queue -> receipts/events/P&L
        |
        v
Audit + Profit/Loss + Submission Proof Panel
```

## Tech Stack

Next.js App Router, TypeScript, Tailwind, shadcn-style UI primitives, Framer Motion, Prisma, SQLite, Stripe test mode, local Hermes/Nemotron adapter, deterministic mock fallback for demo mode.

## Key Routes

- `/submission-live` live proof panel for judges
- `/judge-demo` 90-second business run
- `/stripe-revenue` Stripe checkout and revenue panel
- `/orders` customer orders
- `/approvals` founder approval queue
- `/budget-firewall` spend firewall
- `/audit` receipt log
- `/profit-loss` P&L dashboard
- `/operations` live event stream
- `/submission` static submission page

## Fresh Clone Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open:

```text
http://localhost:3000/submission-live
```

## Environment

Copy `.env.example` to `.env`.

```bash
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_MODE=true
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
LLM_PROVIDER=mock
HERMES_BASE_URL=http://127.0.0.1:8642/v1
HERMES_MODEL=hermes-agent
HERMES_API_KEY=
```

Do not commit API keys.

## Stripe Test Mode

Set test keys and disable demo fallback:

```bash
DEMO_MODE=false
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed secret into `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Use Stripe test card `4242 4242 4242 4242` with any future expiry and CVC. On `checkout.session.completed`, the webhook updates the order to `paid`, records a Stripe receipt, writes a Stripe agent event, and updates the P&L.

## Hermes / Nemotron

Connect Hermes:

```bash
nemohermes hermes connect
```

Set:

```bash
LLM_PROVIDER=hermes
HERMES_BASE_URL=http://127.0.0.1:8642/v1
HERMES_MODEL=hermes-agent
HERMES_API_KEY=your-local-token
```

Smoke test:

```bash
curl http://127.0.0.1:8642/v1/chat/completions \
  -H "Authorization: Bearer $HERMES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"hermes-agent","messages":[{"role":"user","content":"Return JSON {\"status\":\"ok\"}."}],"temperature":0,"max_tokens":40}'
```

Creative agents use Hermes/Nemotron. CFO policy, risk, approvals, audit, and P&L remain deterministic.

## Demo Script

1. Open `/submission-live`.
2. Point to runtime, Stripe, Hermes, latest run, latest checkout session, latest webhook event, and proof panel.
3. Click **Run Live Test Demo**.
4. Stripe Checkout opens. Pay with the test card.
5. Return to the app after success.
6. Show `/orders`: the order changes from `checkout_created` to `paid` after the webhook.
7. Show `/budget-firewall`: `$6` Web3Data auto-approves, `$9` LeadList Lite needs approval, `$60` infrastructure blocks.
8. Open `/approvals` and approve or reject LeadList Lite.
9. Show `/audit`: receipts and matched rules are stored.
10. Show `/profit-loss`: revenue, cost, blocked risk, and profit come from Prisma.


## MCP Connection

VentureOps includes a local MCP stdio server so MCP-compatible clients can call the running product through safe app APIs.

Start the app first:

```bash
npm run build
npm run start
```

Then configure your MCP client with:

```json
{
  "mcpServers": {
    "ventureops-autopilot": {
      "command": "node",
      "args": ["scripts/mcp-server.mjs"],
      "cwd": "C:\\Users\\msi\\Documents\\VentureOps Autopilot",
      "env": {
        "VENTUREOPS_APP_URL": "http://localhost:3000"
      }
    }
  }
}
```

The ready-to-edit example is in `mcp/ventureops-autopilot.mcp.json`.

Exposed MCP tools: `runtime_status`, `hermes_smoke_test`, `latest_run`, `orders`, `receipts`, `pnl`, `start_business_run`, and `create_stripe_checkout`.

The MCP server never exposes API keys. It calls the local Next.js API; deterministic policy/risk/audit logic remains inside the app.

## Quality Checks

```bash
npm run lint
npm run build
```

Optional demo seed, only for demo mode:

```bash
npm run demo
```

## Sponsor Alignment

- Hermes: skill pack in `hermes-skills/ventureops-autopilot`, plus local Hermes/Nemotron structured calls.
- Stripe: test-mode Checkout, product/price reuse, webhook reconciliation, order and revenue records.
- NVIDIA/NemoClaw-style safety: manifests in `nvidia/`, network and credential boundaries, deterministic budget firewall, approval queue, auditable action logs.

## Screenshots

Submission screenshot placeholders live in `screenshots/`:

- `live-run.svg`
- `stripe-checkout.svg`
- `audit-receipts.svg`
- `pnl.svg`

Replace with captured PNGs if the submission form requires browser screenshots.

## Limitations

- No live-money production mode.
- SQLite is local for hackathon judging.
- Demo fallback is explicit and controlled by `DEMO_MODE=true`.
- Hermes and Stripe require local credentials and services for live proof mode.

## Final Submission Checklist

- [x] No secrets in repo
- [x] `.env.example` uses safe placeholders
- [x] `.gitignore` excludes `node_modules`, `.next`, `.env`, local DB files, logs, and build info
- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] `/submission-live` explains the product in 30 seconds
- [x] Stripe test-mode and Hermes local modes are clearly labeled

## License

MIT. See `LICENSE`.
