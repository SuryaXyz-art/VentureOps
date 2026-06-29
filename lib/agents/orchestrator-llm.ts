import type { AgentEvent, BoardroomMessage, WorkflowResult } from "@/lib/agents/types";
import { runAuditAgent } from "@/lib/agents/audit-agent";
import { runCeoAgentWithLlm } from "@/lib/agents/ceo-agent";
import { runCfoAgent } from "@/lib/agents/cfo-agent";
import { runGrowthAgentWithLlm } from "@/lib/agents/growth-agent";
import { runLearningAgentWithLlm } from "@/lib/agents/learning-agent";
import { runOpsAgent } from "@/lib/agents/ops-agent";
import { runRiskAgent } from "@/lib/agents/risk-agent";
import { runSpendAgent } from "@/lib/agents/spend-agent";
import { runStripeAgent } from "@/lib/agents/stripe-agent";

const createdAt = "2026-06-27T15:30:00.000Z";

function payloadOf<T>(event: AgentEvent<T>) {
  return event.payload as T;
}

function createBoardroom(result: Pick<WorkflowResult, "spendDecisions" | "pnl">): BoardroomMessage[] {
  return [
    { id: "msg_ceo", timestamp: createdAt, agent: "CEO", message: "Creative planning may use Hermes/Nemotron when connected; budget constraints remain fixed.", decision: "proposed" },
    { id: "msg_cfo", timestamp: createdAt, agent: "CFO", message: "Approved deterministic constraints: $25 budget, $10 max single spend, receipts required, and approval above $8.", decision: "approved", emphasis: "win" },
    { id: "msg_growth", timestamp: createdAt, agent: "Growth", message: "Offer copy can be generated creatively, but cannot approve spend or change policy.", decision: "proposed" },
    { id: "msg_stripe", timestamp: createdAt, agent: "Stripe", message: "Prepared the test-mode offer object at $19.", decision: "approved" },
    ...result.spendDecisions.map((decision) => ({
      id: `msg_risk_${decision.request.id}`,
      timestamp: createdAt,
      agent: "Risk" as const,
      message: `${decision.decision === "approved" ? "Approved" : decision.decision === "needs_approval" ? "APPROVAL NEEDED" : "VETO"}: ${decision.request.vendor} $${decision.request.amount}. ${decision.reason}`,
      decision: decision.decision,
      emphasis: decision.decision === "blocked" ? "veto" as const : decision.decision === "approved" ? "win" as const : "normal" as const
    })),
    { id: "msg_ops", timestamp: createdAt, agent: "Ops", message: "Report generation can use Hermes/Nemotron, while fulfillment status is audited deterministically.", decision: "fulfilled" },
    { id: "msg_audit", timestamp: createdAt, agent: "Audit", message: `Audit packet completed. P&L: $${result.pnl.revenue} revenue, $${result.pnl.approvedCosts} approved cost, $${result.pnl.profit} profit, $${result.pnl.blockedSpend} blocked spend.`, decision: "audited" },
    { id: "msg_learning", timestamp: createdAt, agent: "Learning", message: "Learning recommendations can use Hermes, but cannot override spend decisions.", decision: "recommended" }
  ];
}

export async function runAgentWorkflowWithLlm(goal: string, budget = 25): Promise<WorkflowResult> {
  const ceoEvent = await runCeoAgentWithLlm(goal);
  const plan = payloadOf(ceoEvent);
  const cfoEvent = runCfoAgent(plan, budget);
  const budgetPolicy = payloadOf(cfoEvent);
  const growthEvent = await runGrowthAgentWithLlm(plan);
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
  const learningEvent = await runLearningAgentWithLlm(spendDecisions);
  const learning = payloadOf(learningEvent);
  const events = [...coreEvents, auditEvent, learningEvent];
  const approvedCosts = spendDecisions.filter((decision) => decision.decision === "approved").reduce((sum, decision) => sum + decision.request.amount, 0);
  const blockedSpend = spendDecisions.filter((decision) => decision.decision === "blocked").reduce((sum, decision) => sum + decision.request.amount, 0);
  const revenue = stripe.price;
  const pnl = { revenue, approvedCosts, profit: revenue - approvedCosts, blockedSpend };

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
    boardroom: createBoardroom({ spendDecisions, pnl }),
    pnl
  };
}
