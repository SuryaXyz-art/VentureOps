export type PolicyMode = "shadow" | "live_test";
export type RiskLevel = "low" | "medium" | "high";
export type PolicyDecision = "approved" | "needs_approval" | "blocked";
export type PolicyCategory = "data" | "leads" | "ads" | "infrastructure" | "infra" | "unknown";

export interface BudgetPolicyConfig {
  totalBudget: number;
  spentSoFar: number;
  maxSingleSpend: number;
  allowedVendors: string[];
  blockedVendors: string[];
  allowedCategories: PolicyCategory[];
  blockedCategories: PolicyCategory[];
  requiresReason: boolean;
  requiresReceipt: boolean;
  approvalThreshold: number;
  mode: PolicyMode;
  riskLevel: RiskLevel;
}

export interface PolicySpendRequest {
  id: string;
  vendor: string;
  amount: number;
  category: PolicyCategory;
  reason: string;
  requestedBy: string;
  riskLevel: RiskLevel;
}

export interface PolicyEvaluation {
  requestId: string;
  decision: PolicyDecision;
  reason: string;
  matchedRules: string[];
  remainingBudget: number;
  receiptRequired: boolean;
  riskScore: number;
}

export interface EvaluatedSpend {
  request: PolicySpendRequest;
  evaluation: PolicyEvaluation;
}
