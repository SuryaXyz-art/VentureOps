import type { BudgetPolicy, BusinessPlan } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";

export function runCfoAgent(plan: BusinessPlan, totalBudget = 25) {
  const policy: BudgetPolicy = {
    totalBudget,
    maxSingleSpend: 10,
    allowedVendors: ["Web3Data API", "LeadList Lite"],
    blockedCategories: ["infra", "unknown"],
    approvalThreshold: 8,
    receiptRequirement: true
  };

  return createAgentEvent({
    id: "evt_cfo_policy",
    role: "CFO",
    title: "CFO creates budget policy",
    detail: `$${policy.totalBudget} budget, $${policy.maxSingleSpend} max single spend, receipts required for every tool action.`,
    status: "approved",
    action: "create_budget_policy",
    decision: "approved",
    reason: `Protect margin on the $${plan.priceRecommendation} offer while still allowing small public-data purchases.`,
    policyMatched: "cfo_budget_envelope_v1",
    payload: policy
  });
}
