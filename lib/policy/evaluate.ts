import type {
  BudgetPolicyConfig,
  EvaluatedSpend,
  PolicyEvaluation,
  PolicySpendRequest,
  RiskLevel
} from "@/lib/policy/types";

const riskWeights: Record<RiskLevel, number> = {
  low: 18,
  medium: 52,
  high: 86
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includesNormalized(items: string[], value: string) {
  return items.map(normalize).includes(normalize(value));
}

function calculateRiskScore(request: PolicySpendRequest, policy: BudgetPolicyConfig) {
  let score = riskWeights[request.riskLevel];

  if (request.amount > policy.approvalThreshold) score += 12;
  if (request.amount > policy.maxSingleSpend) score += 18;
  if (request.amount > policy.totalBudget - policy.spentSoFar) score += 22;
  if (includesNormalized(policy.blockedCategories, request.category)) score += 20;
  if (includesNormalized(policy.blockedVendors, request.vendor)) score += 20;
  if (!includesNormalized(policy.allowedVendors, request.vendor)) score += 8;

  return Math.min(100, score);
}

export function evaluateSpend(
  request: PolicySpendRequest,
  policy: BudgetPolicyConfig,
  approvedInBatch = 0
): PolicyEvaluation {
  const matchedRules: string[] = [];
  const startingRemainingBudget = policy.totalBudget - policy.spentSoFar - approvedInBatch;
  const remainingIfApproved = startingRemainingBudget - request.amount;
  const riskScore = calculateRiskScore(request, policy);

  if (policy.requiresReason) {
    matchedRules.push("requires_reason");
    if (!request.reason.trim()) {
      return {
        requestId: request.id,
        decision: "blocked",
        reason: "Blocked because the spend request does not include a business reason.",
        matchedRules,
        remainingBudget: startingRemainingBudget,
        receiptRequired: policy.requiresReceipt,
        riskScore
      };
    }
  }

  if (policy.requiresReceipt) {
    matchedRules.push("requires_receipt");
  }

  if (includesNormalized(policy.blockedVendors, request.vendor)) {
    matchedRules.push("blocked_vendor");
  }

  if (includesNormalized(policy.blockedCategories, request.category)) {
    matchedRules.push("blocked_category");
  }

  if (!includesNormalized(policy.allowedVendors, request.vendor)) {
    matchedRules.push("vendor_not_allowed");
  }

  if (!includesNormalized(policy.allowedCategories, request.category)) {
    matchedRules.push("category_not_allowed");
  }

  if (request.amount > startingRemainingBudget) {
    matchedRules.push("insufficient_remaining_budget");
  }

  if (request.amount > policy.maxSingleSpend) {
    matchedRules.push("max_single_spend_exceeded");
  }

  if (request.riskLevel === "high") {
    matchedRules.push("high_risk_request");
  }

  const blockingRules = matchedRules.filter((rule) =>
    [
      "blocked_vendor",
      "blocked_category",
      "vendor_not_allowed",
      "category_not_allowed",
      "insufficient_remaining_budget",
      "max_single_spend_exceeded",
      "high_risk_request"
    ].includes(rule)
  );

  if (blockingRules.length > 0) {
    return {
      requestId: request.id,
      decision: "blocked",
      reason: `Blocked by ${blockingRules.join(", ")}.`,
      matchedRules,
      remainingBudget: startingRemainingBudget,
      receiptRequired: policy.requiresReceipt,
      riskScore
    };
  }

  if (request.amount > policy.approvalThreshold || request.riskLevel === "medium") {
    matchedRules.push("approval_threshold");
    return {
      requestId: request.id,
      decision: "needs_approval",
      reason: `Needs founder approval because $${request.amount.toFixed(2)} is above the $${policy.approvalThreshold.toFixed(2)} autonomous threshold or carries medium risk.`,
      matchedRules,
      remainingBudget: startingRemainingBudget,
      receiptRequired: policy.requiresReceipt,
      riskScore
    };
  }

  matchedRules.push(policy.mode === "shadow" ? "shadow_approved" : "live_test_approved");

  return {
    requestId: request.id,
    decision: "approved",
    reason: "Approved because vendor, category, amount, risk, reason, and budget all satisfy policy.",
    matchedRules,
    remainingBudget: remainingIfApproved,
    receiptRequired: policy.requiresReceipt,
    riskScore
  };
}

export function evaluateSpendBatch(
  requests: PolicySpendRequest[],
  policy: BudgetPolicyConfig
): EvaluatedSpend[] {
  let approvedInBatch = 0;

  return requests.map((request) => {
    const evaluation = evaluateSpend(request, policy, approvedInBatch);
    if (evaluation.decision === "approved") {
      approvedInBatch += request.amount;
    }
    return { request, evaluation };
  });
}
