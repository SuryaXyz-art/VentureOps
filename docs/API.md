# API Reference

All endpoints return JSON. Error responses use:

```json
{ "error": "Human-readable error message" }
```

## Runtime

### `GET /api/runtime/status`
Returns safe runtime status. It never exposes secret values.

```json
{
  "demoMode": false,
  "mode": "live_test",
  "appUrl": "http://localhost:3000",
  "stripeConfigured": true,
  "stripeWebhookConfigured": true,
  "llmProvider": "hermes",
  "hermesConfigured": true,
  "hermesBaseUrl": "http://127.0.0.1:8642/v1"
}
```

### `GET /api/llm/status`
Returns LLM provider, model, host, connection telemetry, and deterministic-control notes.

### `POST /api/llm/smoke-test`
Calls Hermes with a strict JSON smoke prompt and records a System `AgentEvent`.

## Runs

### `POST /api/runs/start`
Starts a persistent business run.

Request:

```json
{
  "goal": "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.",
  "budgetCents": 2500,
  "customerEmail": "founder@example.com",
  "mode": "stripe_test"
}
```

Response includes the saved run, checkout metadata, events, spend requests, policy decisions, receipts, reports, and P&L records.

### `GET /api/runs/latest`
Returns the latest non-failed live/test run and related records.

### `GET /api/runs/[id]`
Returns a specific run with related records.

## Stripe

### `POST /api/stripe/create-checkout`
Creates a real Stripe test-mode Checkout Session when keys are configured. In `DEMO_MODE=true`, it uses an explicit demo fallback.

Request:

```json
{
  "customerEmail": "founder@example.com",
  "customerName": "Demo Founder",
  "productName": "AI Web3 Founder Research Report",
  "amountCents": 1900,
  "businessRunId": "optional_run_id"
}
```

### `POST /api/stripe/webhook`
Verifies Stripe signature in live test mode. Handles `checkout.session.completed` by updating order status, Stripe events, receipts, agent events, and P&L.

## Dashboards

- `GET /api/orders?sessionId=cs_test_...`
- `GET /api/receipts`
- `GET /api/events`
- `GET /api/pnl`
- `GET /api/approvals`

## Approvals

- `POST /api/approvals/[id]/approve`
- `POST /api/approvals/[id]/reject`

Approval actions update `PolicyDecision`, create receipts/events, and recalculate run economics.

## MCP Tools

The local MCP server calls these APIs rather than reading secrets or direct database state. See `mcp/README.md`.