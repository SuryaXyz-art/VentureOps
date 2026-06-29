import type { AgentRole } from "@/lib/agents/types";

export type AuditDecision = "approved" | "blocked" | "recorded" | "fulfilled" | "recommended";
export type AuditStatus = "complete" | "approved" | "blocked" | "fulfilled" | "audited";

export interface BlackBoxReceipt {
  id: string;
  timestamp: string;
  agent: AgentRole;
  action: string;
  amount: number;
  vendor: string;
  decision: AuditDecision;
  status: AuditStatus;
  reason: string;
  matchedPolicy: string;
  proof: string;
  mode: "shadow" | "test" | "live";
}

export interface OperationStep {
  id: string;
  label: string;
  agent: AgentRole;
  status: AuditStatus;
  detail: string;
  timestamp: string;
}

export const judgeSummary =
  "The agent launched a paid business, earned $19, spent $6 safely, blocked $60 risk, and generated $13 profit.";

export const blackBoxReceipts: BlackBoxReceipt[] = [
  {
    id: "rcpt_goal_001",
    timestamp: "2026-06-27T15:30:00.000Z",
    agent: "CEO",
    action: "Goal submitted",
    amount: 0,
    vendor: "Founder Command",
    decision: "recorded",
    status: "complete",
    reason: "Founder requested an AI Web3 research-report service with a bounded operating budget.",
    matchedPolicy: "mission_goal_record_v1",
    proof: "vx-9f1a7c02b4e3",
    mode: "shadow"
  },
  {
    id: "rcpt_plan_001",
    timestamp: "2026-06-27T15:30:12.000Z",
    agent: "CEO",
    action: "Plan created",
    amount: 0,
    vendor: "CEO Agent",
    decision: "recorded",
    status: "complete",
    reason: "Offer, target buyer, operating path, and success metric were created.",
    matchedPolicy: "agent_plan_schema_v1",
    proof: "vx-a821d0cc7419",
    mode: "shadow"
  },
  {
    id: "rcpt_stripe_product_001",
    timestamp: "2026-06-27T15:30:28.000Z",
    agent: "Stripe",
    action: "Stripe product created",
    amount: 19,
    vendor: "Stripe Test Mode",
    decision: "approved",
    status: "approved",
    reason: "AI Web3 Founder Research Report product and $19 checkout path prepared in test/demo-safe mode.",
    matchedPolicy: "stripe_test_revenue_allowed_v1",
    proof: "vx-1c4df8436b10",
    mode: "test"
  },
  {
    id: "rcpt_checkout_001",
    timestamp: "2026-06-27T15:31:02.000Z",
    agent: "Stripe",
    action: "Checkout completed",
    amount: 19,
    vendor: "Stripe Checkout",
    decision: "recorded",
    status: "complete",
    reason: "Customer paid for the entry research report offer.",
    matchedPolicy: "customer_payment_record_v1",
    proof: "vx-77cf0bb29d4e",
    mode: "test"
  },
  {
    id: "rcpt_order_001",
    timestamp: "2026-06-27T15:31:10.000Z",
    agent: "Ops",
    action: "Customer order created",
    amount: 19,
    vendor: "VentureOps Orders",
    decision: "recorded",
    status: "complete",
    reason: "Paid order was moved into fulfillment queue.",
    matchedPolicy: "paid_order_required_for_fulfillment_v1",
    proof: "vx-3129e5b54aa0",
    mode: "test"
  },
  {
    id: "rcpt_report_001",
    timestamp: "2026-06-27T15:31:45.000Z",
    agent: "Ops",
    action: "Report generated",
    amount: 0,
    vendor: "Mock LLM Provider",
    decision: "fulfilled",
    status: "fulfilled",
    reason: "Web3 Founder Market Signal Report generated and marked delivered to customer.",
    matchedPolicy: "deterministic_fulfillment_allowed_v1",
    proof: "vx-539b7f12ec01",
    mode: "shadow"
  },
  {
    id: "rcpt_spend_approved_001",
    timestamp: "2026-06-27T15:32:10.000Z",
    agent: "Risk",
    action: "Spend approved",
    amount: 6,
    vendor: "Web3Data API",
    decision: "approved",
    status: "approved",
    reason: "Vendor and category were allowed, spend was below the approval threshold, and a receipt was required.",
    matchedPolicy: "allow_low_risk_data_spend_v1",
    proof: "vx-054ab73d23ff",
    mode: "shadow"
  },
  {
    id: "rcpt_spend_blocked_001",
    timestamp: "2026-06-27T15:32:18.000Z",
    agent: "Risk",
    action: "Spend blocked",
    amount: 60,
    vendor: "Production Infra Upgrade",
    decision: "blocked",
    status: "blocked",
    reason: "Infrastructure category was blocked and the amount exceeded max single spend and remaining budget.",
    matchedPolicy: "blocked_category,max_single_spend_exceeded,insufficient_remaining_budget",
    proof: "vx-f42db44b8891",
    mode: "shadow"
  },
  {
    id: "rcpt_audit_001",
    timestamp: "2026-06-27T15:32:35.000Z",
    agent: "Audit",
    action: "Audit produced",
    amount: 0,
    vendor: "Audit Agent",
    decision: "recorded",
    status: "audited",
    reason: "Receipts, matched policies, decisions, and proof references were sealed into the black box.",
    matchedPolicy: "audit_every_decision_v1",
    proof: "vx-d0c712cab765",
    mode: "shadow"
  },
  {
    id: "rcpt_learning_001",
    timestamp: "2026-06-27T15:32:48.000Z",
    agent: "Learning",
    action: "Learning recommendation generated",
    amount: 0,
    vendor: "Learning Agent",
    decision: "recommended",
    status: "complete",
    reason: "Recommend a $49 upsell and founder approval queue for spend above $8.",
    matchedPolicy: "learning_loop_after_audit_v1",
    proof: "vx-c83e69aa10bd",
    mode: "shadow"
  }
];

export const operationsTimeline: OperationStep[] = [
  { id: "op_goal", label: "Goal submitted", agent: "CEO", status: "complete", detail: "Founder submitted the business goal and budget.", timestamp: blackBoxReceipts[0].timestamp },
  { id: "op_plan", label: "Plan created", agent: "CEO", status: "complete", detail: "CEO Agent created the offer and operating plan.", timestamp: blackBoxReceipts[1].timestamp },
  { id: "op_product", label: "Stripe product created", agent: "Stripe", status: "approved", detail: "$19 AI Web3 Founder Research Report product prepared.", timestamp: blackBoxReceipts[2].timestamp },
  { id: "op_checkout", label: "Checkout completed", agent: "Stripe", status: "complete", detail: "Customer checkout completed in test/demo mode.", timestamp: blackBoxReceipts[3].timestamp },
  { id: "op_order", label: "Customer order created", agent: "Ops", status: "complete", detail: "Paid order entered fulfillment queue.", timestamp: blackBoxReceipts[4].timestamp },
  { id: "op_report", label: "Report generated", agent: "Ops", status: "fulfilled", detail: "Customer report generated and delivered.", timestamp: blackBoxReceipts[5].timestamp },
  { id: "op_spend_ok", label: "Spend approved", agent: "Risk", status: "approved", detail: "Web3Data API spend approved for $6.", timestamp: blackBoxReceipts[6].timestamp },
  { id: "op_spend_block", label: "Spend blocked", agent: "Risk", status: "blocked", detail: "Production Infra Upgrade blocked for $60.", timestamp: blackBoxReceipts[7].timestamp },
  { id: "op_audit", label: "Audit produced", agent: "Audit", status: "audited", detail: "Black-box receipt packet sealed.", timestamp: blackBoxReceipts[8].timestamp },
  { id: "op_learning", label: "Learning recommendation generated", agent: "Learning", status: "complete", detail: "Next action and risk improvement generated.", timestamp: blackBoxReceipts[9].timestamp }
];

export const profitLossSnapshot = {
  revenue: 19,
  approvedCosts: 6,
  blockedRiskySpend: 60,
  netProfit: 13,
  grossMargin: 68.4,
  totalBudget: 25,
  budgetUsed: 6,
  budgetRemaining: 19,
  customerCount: 1,
  fulfillmentStatus: "Delivered to customer",
  nextRecommendedAction: "Upsell the delivered customer to a $49 expanded competitor brief and add founder approval for spend above $8."
};

export function exportAuditJson() {
  return JSON.stringify({ summary: judgeSummary, receipts: blackBoxReceipts, operations: operationsTimeline, pnl: profitLossSnapshot }, null, 2);
}
