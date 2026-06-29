import type { PolicyEvaluation, PolicySpendRequest } from "@/lib/policy/types";

export interface PolicyReceipt {
  id: string;
  requestId: string;
  vendor: string;
  amount: number;
  decision: PolicyEvaluation["decision"];
  issuedAt: string;
  reason: string;
  matchedRules: string[];
}

export function createPolicyReceipt(
  request: PolicySpendRequest,
  evaluation: PolicyEvaluation
): PolicyReceipt {
  return {
    id: `${evaluation.decision}_${request.id}_receipt`,
    requestId: request.id,
    vendor: request.vendor,
    amount: request.amount,
    decision: evaluation.decision,
    issuedAt: "2026-06-27T15:30:00.000Z",
    reason: evaluation.reason,
    matchedRules: evaluation.matchedRules
  };
}

export function createPolicyReceipts(
  evaluated: Array<{ request: PolicySpendRequest; evaluation: PolicyEvaluation }>
) {
  return evaluated.map(({ request, evaluation }) => createPolicyReceipt(request, evaluation));
}
