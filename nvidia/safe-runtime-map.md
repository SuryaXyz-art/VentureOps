# Safe Runtime Map

VentureOps Autopilot maps the business-control-tower demo to four runtime boundaries.

## 1. Credential Boundary

Secrets are supplied through environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NOUS_API_KEY`
- `NVIDIA_API_KEY`

Policy requirements:

- Do not print environment variables.
- Do not expose API keys in receipts, UI, logs, or audit exports.
- Redact Stripe, Nous, and NVIDIA key-shaped values.
- Do not log card details.

## 2. Network Boundary

Allowed domains are documented, not discovered dynamically:

- `localhost`
- `api.stripe.com`
- `checkout.stripe.com`
- `mcp.stripe.com`
- `portal.nousresearch.com`
- `build.nvidia.com`

Blocked categories:

- Unknown ad networks
- Crypto trading sites
- Unapproved SaaS billing pages

## 3. Spend Boundary

Every spend request must include:

- Vendor
- Amount
- Category
- Reason
- Risk level

The budget firewall evaluates:

- `max_single_spend`
- `max_total_budget`
- `require_receipt`
- `require_user_approval_above_threshold`
- Vendor/category allowlists and blocklists

## 4. Audit Boundary

Every approval, block, and recorded action produces an audit receipt:

- Receipt id
- Timestamp
- Agent
- Action
- Amount
- Vendor
- Decision
- Reason
- Matched policy
- Hash-like proof
- Mode

The audit boundary is visible in `/audit` and exportable as JSON.

## Demo Statement

This is a local/test-mode hackathon implementation. It demonstrates the safety architecture and deterministic decisions without claiming production-grade sandbox enforcement.
