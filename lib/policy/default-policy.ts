import type { BudgetPolicyConfig, PolicySpendRequest } from "@/lib/policy/types";

export const defaultBudgetPolicy: BudgetPolicyConfig = {
  totalBudget: 25,
  spentSoFar: 0,
  maxSingleSpend: 10,
  allowedVendors: ["Web3Data API", "LeadList Lite"],
  blockedVendors: ["Production Infra Upgrade"],
  allowedCategories: ["data", "leads"],
  blockedCategories: ["infrastructure", "infra", "ads", "unknown"],
  requiresReason: true,
  requiresReceipt: true,
  approvalThreshold: 8,
  mode: "shadow",
  riskLevel: "medium"
};

export const sampleSpendRequests: PolicySpendRequest[] = [
  {
    id: "spend_web3data_api",
    vendor: "Web3Data API",
    amount: 6,
    category: "data",
    reason: "Enrich the report with compliant public Web3 company and category data.",
    requestedBy: "Spend Agent",
    riskLevel: "low"
  },
  {
    id: "spend_leadlist_lite",
    vendor: "LeadList Lite",
    amount: 9,
    category: "leads",
    reason: "Buy a small founder lead sample for launch validation.",
    requestedBy: "Spend Agent",
    riskLevel: "medium"
  },
  {
    id: "spend_production_infra_upgrade",
    vendor: "Production Infra Upgrade",
    amount: 60,
    category: "infrastructure",
    reason: "Upgrade production hosting before revenue is validated.",
    requestedBy: "Ops Agent",
    riskLevel: "high"
  },
  {
    id: "spend_unknown_ads_boost",
    vendor: "Unknown Ads Boost",
    amount: 15,
    category: "ads",
    reason: "Boost launch post through an unverified paid ads vendor.",
    requestedBy: "Growth Agent",
    riskLevel: "medium"
  }
];
