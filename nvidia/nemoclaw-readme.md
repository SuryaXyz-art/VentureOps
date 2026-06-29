# NemoClaw / OpenShell-Style Runtime Alignment

VentureOps Autopilot is designed for a NemoClaw/OpenShell-style safe runtime.

The current hackathon demo runs in local/test mode. It does not claim production deployment, live money movement, live model execution, or unrestricted network access. Demo mode is deterministic and safe for judging. Stripe behavior is either demo fallback or Stripe test mode when test credentials are configured.

## Controlled Runtime Principles

The safety layer mirrors controlled runtime principles:

- Credential isolation: API keys and webhook secrets are read from environment variables and are not printed into UI, audit exports, or logs.
- Network allowlists: expected domains are documented in `openshell-policy.json` and `network-allowlist.example.json`.
- Policy-gated spend: each spend request is evaluated before execution against budget, vendor, category, approval threshold, and risk level.
- Auditable action logs: approvals, blocks, receipts, matched policy rules, and proof references are visible in `/audit`.
- Replayable decisions: `/operations`, `/profit-loss`, and `/audit` use the same deterministic black-box dataset so judges can replay the business run.

## Current Demo Boundaries

- Local/test mode only.
- No real production charges are required.
- No real card details are stored.
- LLM provider defaults to mock mode.
- Stripe test mode is optional and requires explicit environment variables.

## Runtime Map

1. Credential boundary: secrets stay in environment variables and are redacted by policy.
2. Network boundary: Stripe, Nous, NVIDIA, and localhost are the only documented allowed domains.
3. Spend boundary: the budget firewall blocks unsafe or unapproved spend before execution.
4. Audit boundary: every decision is recorded as a receipt and can be exported as JSON.

## Files

- `nvidia/openshell-policy.json`: machine-readable policy manifest.
- `nvidia/network-allowlist.example.json`: example network boundary configuration.
- `nvidia/safe-runtime-map.md`: human-readable runtime boundary map.
