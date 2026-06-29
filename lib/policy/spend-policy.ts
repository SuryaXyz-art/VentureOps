import type { SpendRequest } from "@/lib/agents/types";

export interface PolicyDecision {
  requestId: string;
  approved: boolean;
  reason: string;
}

const riskyTerms = ["wallet seed", "private key", "guaranteed token call", "unbounded"];

export function evaluateSpendRequest(
  request: SpendRequest,
  remainingBudget: number
): PolicyDecision {
  const lowerPurpose = request.purpose.toLowerCase();
  const unsafeTerm = riskyTerms.find((term) => lowerPurpose.includes(term));

  if (unsafeTerm) {
    return {
      requestId: request.id,
      approved: false,
      reason: `Blocked because purpose includes unsafe term: ${unsafeTerm}.`
    };
  }

  if (request.amount > remainingBudget) {
    return {
      requestId: request.id,
      approved: false,
      reason: `Blocked because $${request.amount.toFixed(2)} exceeds remaining budget.`
    };
  }

  if (request.risk === "high") {
    return {
      requestId: request.id,
      approved: false,
      reason: "Blocked because high-risk spend requires founder approval."
    };
  }

  return {
    requestId: request.id,
    approved: true,
    reason: "Approved within budget, declared purpose, and low-risk category."
  };
}
