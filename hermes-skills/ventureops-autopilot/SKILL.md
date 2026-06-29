# VentureOps Autopilot Skill

## Purpose

VentureOps Autopilot is an Agentic Business Control Tower for launching and operating a tiny paid business under explicit budget and safety controls.

A founder provides a business goal and operating budget. The skill coordinates specialist agents to create a business plan, prepare a paid Stripe offer, request and evaluate spend, fulfill a customer order, record receipts, and produce a P&L audit report.

This skill is designed for the Hermes Agent Accelerated Business Hackathon demo. It is deterministic by default so judging is stable, and it can use Stripe test mode when environment variables are configured.

## Trigger Phrases

Use this skill when the user says or implies:

- "launch a micro-business"
- "create a paid offer"
- "run business with budget"
- "approve agent spend"
- "fulfill customer order"
- "generate P&L audit"

## Inputs

```yaml
business_goal: string
operating_budget: number
customer_type: string
live_mode: boolean
```

Example:

```yaml
business_goal: "Launch a paid AI research-report service for Web3 founders"
operating_budget: 25
customer_type: "Web3 founders"
live_mode: false
```

## Outputs

```yaml
business_plan:
  offer_name: string
  target_customer: string
  price_recommendation: number
  operating_plan: string[]
  success_metric: string
stripe_product:
  product_name: string
  price: number
  checkout_description: string
checkout_link: string
spend_policy:
  total_budget: number
  max_single_spend: number
  allowed_vendors: string[]
  blocked_categories: string[]
  approval_threshold: number
  receipt_requirement: boolean
receipts:
  - receipt_id: string
    timestamp: string
    agent: string
    action: string
    amount: number
    vendor: string
    decision: string
    reason: string
    matched_policy: string
p_and_l_report:
  revenue: number
  approved_costs: number
  blocked_risky_spend: number
  net_profit: number
  gross_margin: number
  next_recommended_action: string
```

## Agent Workflow

1. CEO Agent converts the goal into a concrete micro-business plan.
2. CFO Agent creates the budget envelope and spend policy.
3. Growth Agent creates landing copy, launch copy, and customer personas.
4. Stripe Agent prepares the paid product and checkout path.
5. Spend Agent requests tool, data, or infrastructure spend.
6. Risk Agent evaluates every spend request before execution.
7. Ops Agent fulfills the customer order with a generated report.
8. Audit Agent records receipts, decisions, matched policies, and proof references.
9. Learning Agent recommends the next experiment and risk-control improvement.

## Safety Rules

- Never spend without policy evaluation.
- Never expose secrets or environment variable values.
- Block non-allowlisted vendors.
- Block blocked categories such as unsafe infrastructure or unknown paid ads.
- Require receipts for approved spend.
- Escalate high-risk spends and spends above the approval threshold.
- Record blocked actions, not just successful actions.
- Keep demo mode deterministic and safe for judging.

## Stripe Skills Alignment

VentureOps Autopilot aligns with Stripe-oriented agent commerce patterns without claiming production readiness.

- Stripe Checkout for earning: the app can create a Stripe test-mode Checkout Session for the paid report offer when `STRIPE_SECRET_KEY` is configured.
- Stripe Projects-ready provisioning flow: the code separates product creation, checkout creation, webhook handling, and persistence so a future project/workspace provisioning layer can attach to the same business run.
- Stripe Link / MPP-ready spend flow: spend requests are modeled as policy-gated operations with receipts, approval thresholds, and blocked vendor/category rules. This is a readiness pattern for payment-mediated agent spend, not a live MPP integration.

## Demo Mode

Demo mode is deterministic and safe for judging.

- No Stripe keys are required.
- No real money moves.
- Checkout redirects to the demo success flow.
- Mock LLM mode always generates the seeded `Web3 Founder Market Signal Report`.
- Audit, operations, and P&L dashboards use consistent seeded black-box data.

## Live/Test Mode

Live mode in this project means Stripe test mode, not production real-money operation.

When environment variables are configured, the app can use Stripe test mode:

```bash
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Optional LLM adapters are selected with:

```bash
LLM_PROVIDER=mock | nous | nvidia
NOUS_API_KEY=
NOUS_BASE_URL=
NVIDIA_API_KEY=
NVIDIA_BASE_URL=
```

If keys are absent, the app falls back to deterministic mock behavior.

## Recommended Demo Command

```text
Launch a paid AI research-report service for Web3 founders with a $25 operating budget.
```

Expected judge-facing summary:

```text
The agent launched a paid business, earned $19, spent $6 safely, blocked $60 risk, and generated $13 profit.
```

## Example Files

- `examples/demo-run.md`: full deterministic run.
- `examples/policy-check.md`: spend policy evaluation.
- `examples/stripe-product.md`: Stripe test-mode and demo-mode product flow.
