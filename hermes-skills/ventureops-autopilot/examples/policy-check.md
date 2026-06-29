# Policy Check Example

## Input Spend Requests

```json
[
  {
    "vendor": "Web3Data API",
    "amount": 6,
    "category": "data",
    "riskLevel": "low",
    "reason": "Enrich the report with compliant public Web3 company data."
  },
  {
    "vendor": "LeadList Lite",
    "amount": 9,
    "category": "leads",
    "riskLevel": "medium",
    "reason": "Buy a small founder lead sample for launch validation."
  },
  {
    "vendor": "Production Infra Upgrade",
    "amount": 60,
    "category": "infrastructure",
    "riskLevel": "high",
    "reason": "Upgrade production hosting before revenue is validated."
  },
  {
    "vendor": "Unknown Ads Boost",
    "amount": 15,
    "category": "ads",
    "riskLevel": "medium",
    "reason": "Boost launch post through an unverified ads vendor."
  }
]
```

## Policy

```json
{
  "totalBudget": 25,
  "spentSoFar": 0,
  "maxSingleSpend": 10,
  "allowedVendors": ["Web3Data API", "LeadList Lite"],
  "blockedVendors": ["Production Infra Upgrade"],
  "allowedCategories": ["data", "leads"],
  "blockedCategories": ["infrastructure", "infra", "ads", "unknown"],
  "requiresReason": true,
  "requiresReceipt": true,
  "approvalThreshold": 8,
  "mode": "shadow",
  "riskLevel": "medium"
}
```

## Expected Decisions

```json
[
  {
    "vendor": "Web3Data API",
    "decision": "approved",
    "reason": "Vendor, category, amount, risk, reason, and budget satisfy policy.",
    "receiptRequired": true
  },
  {
    "vendor": "LeadList Lite",
    "decision": "needs_approval",
    "reason": "Spend is above the autonomous approval threshold or carries medium risk.",
    "receiptRequired": true
  },
  {
    "vendor": "Production Infra Upgrade",
    "decision": "blocked",
    "reason": "Blocked vendor/category and amount exceeds safe limits.",
    "receiptRequired": true
  },
  {
    "vendor": "Unknown Ads Boost",
    "decision": "blocked",
    "reason": "Vendor is not allowlisted and ads category is blocked.",
    "receiptRequired": true
  }
]
```

## Safety Notes

- The agent must evaluate policy before spend execution.
- `needs_approval` is not autonomous approval.
- Blocked requests are recorded in the audit log with matched policy rules.
- Receipts are required for both approved and blocked decisions.
