import type { AgentEvent, BoardroomMessage, WorkflowResult } from "@/lib/agents/types";
import { runAuditAgent } from "@/lib/agents/audit-agent";
import { runCeoAgent } from "@/lib/agents/ceo-agent";
import { runCfoAgent } from "@/lib/agents/cfo-agent";
import { runGrowthAgent } from "@/lib/agents/growth-agent";
import { runLearningAgent } from "@/lib/agents/learning-agent";
import { runOpsAgent } from "@/lib/agents/ops-agent";
import { runRiskAgent } from "@/lib/agents/risk-agent";
import { runSpendAgent } from "@/lib/agents/spend-agent";
import { runStripeAgent } from "@/lib/agents/stripe-agent";

const createdAt = "2026-06-27T15:30:00.000Z";

function payloadOf<T>(event: AgentEvent<T>) {
  return event.payload as T;
}

function createBoardroom(events: AgentEvent[], result: Pick<WorkflowResult, "spendDecisions" | "pnl">): BoardroomMessage[] {
  const messages: BoardroomMessage[] = [
    {
      id: "msg_ceo",
      timestamp: createdAt,
      agent: "CEO",
      message: "We can launch a narrow paid research brief today: one customer, one price, one bounded operating budget.",
      decision: "proposed"
    },
    {
      id: "msg_cfo",
      timestamp: createdAt,
      agent: "CFO",
      message: "Approved with constraints: $25 total budget, $10 max single spend, receipts required, and any spend above $8 needs approval.",
      decision: "approved",
      emphasis: "win"
    },
    {
      id: "msg_growth",
      timestamp: createdAt,
      agent: "Growth",
      message: "I have landing copy, a launch tweet, an email pitch, and three founder personas ready for the offer.",
      decision: "proposed"
    },
    {
      id: "msg_stripe",
      timestamp: createdAt,
      agent: "Stripe",
      message: "Prepared the test-mode offer object at $19. No live Stripe call in Phase 2.",
      decision: "approved"
    },
    {
      id: "msg_spend",
      timestamp: createdAt,
      agent: "Spend",
      message: "Requesting Web3Data API for $6, LeadList Lite for $9, and Production Infra Upgrade for $60.",
      decision: "proposed"
    },
    ...result.spendDecisions.map((decision) => ({
      id: `msg_risk_${decision.request.id}`,
      timestamp: createdAt,
      agent: "Risk" as const,
      message: `${decision.decision === "approved" ? "Approved" : decision.decision === "needs_approval" ? "APPROVAL NEEDED" : "VETO"}: ${decision.request.vendor} $${decision.request.amount}. ${decision.reason}`,
      decision: decision.decision,
      emphasis: decision.decision === "blocked" ? "veto" as const : decision.decision === "approved" ? "win" as const : "normal" as const
    })),
    {
      id: "msg_ops",
      timestamp: createdAt,
      agent: "Ops",
      message: "Fulfillment plan is ready and uses only approved public-data requirements.",
      decision: "fulfilled"
    },
    {
      id: "msg_audit",
      timestamp: createdAt,
      agent: "Audit",
      message: `Audit packet completed. P&L: $${result.pnl.revenue} revenue, $${result.pnl.approvedCosts} approved cost, $${result.pnl.profit} profit, $${result.pnl.blockedSpend} blocked spend.`,
      decision: "audited"
    },
    {
      id: "msg_learning",
      timestamp: createdAt,
      agent: "Learning",
      message: "Next cycle: validate with concierge delivery, lift price, and add approval queue for spends above threshold.",
      decision: "recommended"
    }
  ];

  return messages;
}

export function runAgentWorkflow(goal: string, budget = 25): WorkflowResult {
  const ceoEvent = runCeoAgent(goal);
  const plan = payloadOf(ceoEvent);
  const cfoEvent = runCfoAgent(plan, budget);
  const budgetPolicy = payloadOf(cfoEvent);
  const growthEvent = runGrowthAgent(plan);
  const growth = payloadOf(growthEvent);
  const stripeEvent = runStripeAgent(plan);
  const stripe = payloadOf(stripeEvent);
  const opsEvent = runOpsAgent(plan);
  const fulfillment = payloadOf(opsEvent);
  const spendEvent = runSpendAgent();
  const spendRequests = payloadOf(spendEvent);
  const riskEvent = runRiskAgent(spendRequests, budgetPolicy);
  const spendDecisions = payloadOf(riskEvent);

  const coreEvents = [ceoEvent, cfoEvent, growthEvent, stripeEvent, opsEvent, spendEvent, riskEvent];
  const auditEvent = runAuditAgent(coreEvents, spendDecisions);
  const auditLog = payloadOf(auditEvent);
  const learningEvent = runLearningAgent(spendDecisions);
  const learning = payloadOf(learningEvent);
  const events = [...coreEvents, auditEvent, learningEvent];

  const approvedCosts = spendDecisions
    .filter((decision) => decision.decision === "approved")
    .reduce((sum, decision) => sum + decision.request.amount, 0);
  const blockedSpend = spendDecisions
    .filter((decision) => decision.decision === "blocked")
    .reduce((sum, decision) => sum + decision.request.amount, 0);
  const revenue = stripe.price;
  const pnl = {
    revenue,
    approvedCosts,
    profit: revenue - approvedCosts,
    blockedSpend
  };

  const partial = { spendDecisions, pnl };

  return {
    id: "workflow_web3_research_seeded_001",
    goal,
    createdAt,
    plan,
    budgetPolicy,
    growth,
    stripe,
    fulfillment,
    spendRequests,
    spendDecisions,
    auditLog,
    learning,
    events,
    boardroom: createBoardroom(events, partial),
    pnl
  };
}


