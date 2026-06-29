# Demo Run Example

## Input

```yaml
business_goal: "Launch a paid AI research-report service for Web3 founders"
operating_budget: 25
customer_type: "Web3 founders"
live_mode: false
```

## Mode

Demo/simulated. No Stripe keys or LLM keys are required. No real money moves.

## Expected Workflow

1. CEO Agent creates the offer plan.
2. CFO Agent creates a $25 budget policy.
3. Growth Agent creates landing copy, launch post, email pitch, and personas.
4. Stripe Agent prepares the paid offer path.
5. Checkout is completed through demo fallback or Stripe test mode.
6. Ops Agent creates a customer order.
7. Ops Agent generates `Web3 Founder Market Signal Report`.
8. Spend Agent requests Web3Data API and Production Infra Upgrade.
9. Risk Agent approves $6 Web3Data API spend and blocks $60 infrastructure risk.
10. Audit Agent records receipts and matched policy rules.
11. Learning Agent recommends the next pricing and risk-control improvement.

## Expected Summary

```text
The agent launched a paid business, earned $19, spent $6 safely, blocked $60 risk, and generated $13 profit.
```

## Expected Outputs

```json
{
  "business_plan": {
    "offer_name": "AI Web3 Founder Research Report",
    "target_customer": "Web3 founders",
    "price_recommendation": 19
  },
  "checkout_link": "/success?demo=true",
  "spend_policy": {
    "total_budget": 25,
    "max_single_spend": 10,
    "approval_threshold": 8,
    "receipt_requirement": true
  },
  "p_and_l_report": {
    "revenue": 19,
    "approved_costs": 6,
    "blocked_risky_spend": 60,
    "net_profit": 13
  }
}
```

## Judge Pages

- `/operations`
- `/audit`
- `/profit-loss`
- `/orders`
- `/reports/demo-report`
