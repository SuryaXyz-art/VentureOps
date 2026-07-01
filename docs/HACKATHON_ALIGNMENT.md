# Hackathon Alignment

## Agents That Earn

VentureOps creates a Stripe test-mode paid offer and Checkout Session for a micro-business service: an AI Web3 Founder Research Report. Webhook reconciliation updates orders, receipts, events, and P&L.

## Agents That Spend

The Spend Agent proposes data/tool spend. The policy engine evaluates every request against budget, vendor, category, threshold, receipt, and risk rules.

## Agents That Run Operations

The workflow includes planning, budgeting, growth copy, checkout, fulfillment, spend requests, risk review, audit, P&L, and learning recommendations.

## Hermes / Nous / Nemotron

Hermes is wired through a local OpenAI-compatible adapter. The app uses `HERMES_BASE_URL`, `HERMES_MODEL`, and `HERMES_API_KEY`. In the tested local NemoHermes gateway, `/v1/models` exposes `hermes-agent`, which routes through the configured backend model.

Optional Nous and NVIDIA adapters are implemented as OpenAI-compatible chat-completions providers with deterministic fallback when keys/base URLs are missing.

## NVIDIA / NemoClaw-Style Safety

The repository includes `nvidia/openshell-policy.json`, `nvidia/nemoclaw-readme.md`, `nvidia/safe-runtime-map.md`, and `nvidia/network-allowlist.example.json`. These document controlled runtime principles: credential isolation, network allowlists, policy-gated spend, receipt requirements, and replayable action logs.

## Stripe Alignment

Stripe is used for test-mode revenue, product/price reuse, Checkout Sessions, webhook reconciliation, order records, and revenue/P&L proof.

## Judging Story

The judge sees a real business loop: one goal and one budget become a paid offer, checkout, customer order, generated report, spend decisions, blocked unsafe spend, receipts, and profit dashboard.