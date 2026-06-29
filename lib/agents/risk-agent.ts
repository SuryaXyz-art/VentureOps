import type { BudgetPolicy, SpendDecision, SpendRequest } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";

export function evaluateSpendWithPolicy(request: SpendRequest, policy: BudgetPolicy, alreadyApproved: number): SpendDecision {
  const remainingBudget = policy.totalBudget - alreadyApproved;

  if (policy.blockedCategories.includes(request.category)) {
    return {
      request,
      decision: "blocked",
      reason: `${request.category} spend is blocked for this demo operating policy.`,
      policyMatched: "blocked_category_v1"
    };
  }

  if (!policy.allowedVendors.includes(request.vendor)) {
    return {
      request,
      decision: "blocked",
      reason: `${request.vendor} is not on the CFO allowed-vendor list.`,
      policyMatched: "allowed_vendor_list_v1"
    };
  }

  if (request.amount > remainingBudget) {
    return {
      request,
      decision: "blocked",
      reason: `$${request.amount} exceeds the remaining budget of $${remainingBudget}.`,
      policyMatched: "remaining_budget_v1"
    };
  }

  if (request.amount > policy.maxSingleSpend) {
    return {
      request,
      decision: "blocked",
      reason: `$${request.amount} exceeds the max single spend of $${policy.maxSingleSpend}.`,
      policyMatched: "max_single_spend_v1"
    };
  }

  if (request.amount > policy.approvalThreshold) {
    return {
      request,
      decision: "needs_approval",
      reason: `$${request.amount} exceeds the autonomous approval threshold of $${policy.approvalThreshold}; founder approval is required before execution.`,
      policyMatched: "approval_threshold_v1"
    };
  }

  return {
    request,
    decision: "approved",
    reason: "Spend is from an allowed vendor, inside budget, under approval threshold, and receiptable.",
    policyMatched: "allow_low_risk_data_spend_v1",
    receiptId: `rcpt_${request.id}`
  };
}

export function runRiskAgent(requests: SpendRequest[], policy: BudgetPolicy) {
  let approvedTotal = 0;
  const decisions = requests.map((request) => {
    const decision = evaluateSpendWithPolicy(request, policy, approvedTotal);
    if (decision.decision === "approved") {
      approvedTotal += request.amount;
    }
    return decision;
  });

  const approvedCount = decisions.filter((decision) => decision.decision === "approved").length;
  const approvalCount = decisions.filter((decision) => decision.decision === "needs_approval").length;
  const blockedCount = decisions.filter((decision) => decision.decision === "blocked").length;

  return createAgentEvent({
    id: "evt_risk_evaluation",
    role: "Risk",
    title: "Risk evaluates spend requests",
    detail: `${approvedCount} spend approved, ${approvalCount} needs approval, ${blockedCount} blocked by CFO/Risk policy.`,
    status: blockedCount > 0 ? "blocked" : "approved",
    action: "evaluate_spend_policy",
    decision: blockedCount > 0 ? "blocked" : approvalCount > 0 ? "proposed" : "approved",
    reason: "Every spend request was checked against vendor, category, approval threshold, max spend, and remaining budget.",
    policyMatched: "risk_policy_bundle_v1",
    payload: decisions
  });
}
