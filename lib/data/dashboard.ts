import { prisma } from "@/lib/prisma";
import { getRuntimeConfig } from "@/lib/config/runtime";
import type { AgentRole } from "@/lib/agents/types";

export type DashboardOrder = {
  id: string;
  stripeCheckoutId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  productName: string;
  amountCents: number;
  status: string;
  mode: string;
  createdAt: string;
  reportUrl: `/reports/${string}` | null;
};

export type DashboardEvent = {
  id: string;
  role: AgentRole;
  title: string;
  detail: string;
  status: string;
  amountCents: number | null;
  createdAt: string;
};

export type DashboardReceipt = {
  id: string;
  timestamp: string;
  agent: AgentRole;
  action: string;
  amount: number;
  vendor: string;
  decision: "approved" | "blocked" | "recorded" | "fulfilled" | "recommended" | "needs_approval";
  status: "complete" | "approved" | "blocked" | "fulfilled" | "audited" | "needs_approval";
  reason: string;
  matchedPolicy: string;
  proof: string;
  mode: "shadow" | "test" | "live";
};

export type DashboardPnl = {
  revenue: number;
  approvedCosts: number;
  blockedRiskySpend: number;
  netProfit: number;
  grossMargin: number;
  totalBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  customerCount: number;
  fulfillmentStatus: string;
  nextRecommendedAction: string;
  summary: string;
  hasData: boolean;
};

function dollars(cents: number | null | undefined) {
  return (cents ?? 0) / 100;
}

function asAgentRole(role: string | null | undefined): AgentRole {
  const allowed: AgentRole[] = ["CEO", "CFO", "Growth", "Stripe", "Ops", "Risk", "Spend", "Audit", "Learning", "System"];
  return allowed.includes(role as AgentRole) ? role as AgentRole : "Audit";
}

function proofFor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = ((hash << 5) - hash + id.charCodeAt(index)) | 0;
  return `vx-${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

function statusFromDecision(decision: string): DashboardReceipt["status"] {
  if (decision === "approved") return "approved";
  if (decision === "blocked") return "blocked";
  if (decision === "fulfilled") return "fulfilled";
  if (decision === "needs_approval") return "needs_approval";
  return "complete";
}

function liveRunWhere() {
  return getRuntimeConfig().demoMode ? {} : { mode: { not: "demo" } };
}

function liveBusinessRunRelationWhere() {
  return getRuntimeConfig().demoMode ? undefined : { mode: { not: "demo" } };
}

const runInclude = {
  agentEvents: { orderBy: { createdAt: "asc" } },
  spendRequests: { orderBy: { createdAt: "asc" } },
  policyDecisions: { orderBy: { createdAt: "asc" } },
  receipts: { orderBy: { createdAt: "asc" } },
  customerOrders: { orderBy: { createdAt: "desc" }, include: { reports: { orderBy: { createdAt: "desc" }, take: 1 } } },
  stripeEvents: { orderBy: { createdAt: "desc" } },
  profitLossReports: { orderBy: { createdAt: "desc" }, take: 1 },
  fulfillmentReports: { orderBy: { createdAt: "desc" } }
} as const;

export async function getLatestRun() {
  const latestUsable = await prisma.businessRun.findFirst({
    where: { ...liveRunWhere(), status: { not: "failed" } },
    orderBy: { createdAt: "desc" },
    include: runInclude
  });
  if (latestUsable) return latestUsable;
  return prisma.businessRun.findFirst({ where: liveRunWhere(), orderBy: { createdAt: "desc" }, include: runInclude });
}

export async function getDashboardOrders(filters: { sessionId?: string } = {}): Promise<DashboardOrder[]> {
  const orders = await prisma.customerOrder.findMany({
    where: {
      ...(filters.sessionId ? { stripeCheckoutId: filters.sessionId } : {}),
      ...(liveBusinessRunRelationWhere() ? { businessRun: liveBusinessRunRelationWhere() } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { reports: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  return orders.map((order) => ({
    id: order.id,
    stripeCheckoutId: order.stripeCheckoutId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    productName: order.productName,
    amountCents: order.amountCents,
    status: order.status,
    mode: order.mode,
    createdAt: order.createdAt.toISOString(),
    reportUrl: order.reports[0] ? `/reports/${order.reports[0].id}` : null
  }));
}

export async function getDashboardEvents(): Promise<DashboardEvent[]> {
  const events = await prisma.agentEvent.findMany({
    where: liveBusinessRunRelationWhere() ? { businessRun: liveBusinessRunRelationWhere() } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return events.map((event) => ({
    id: event.id,
    role: asAgentRole(event.role),
    title: event.title,
    detail: event.detail,
    status: event.status,
    amountCents: event.amountCents,
    createdAt: event.createdAt.toISOString()
  }));
}

export async function getDashboardReceipts(): Promise<DashboardReceipt[]> {
  const [receipts, decisions] = await Promise.all([
    prisma.receipt.findMany({ where: liveBusinessRunRelationWhere() ? { businessRun: liveBusinessRunRelationWhere() } : undefined, orderBy: { createdAt: "desc" }, take: 100, include: { businessRun: true } }),
    prisma.policyDecision.findMany({ where: liveBusinessRunRelationWhere() ? { businessRun: liveBusinessRunRelationWhere() } : undefined, orderBy: { createdAt: "desc" }, take: 100, include: { businessRun: true } })
  ]);

  const receiptRows: DashboardReceipt[] = receipts.map((receipt) => ({
    id: receipt.id,
    timestamp: receipt.createdAt.toISOString(),
    agent: receipt.source.toLowerCase().includes("stripe") ? "Stripe" : receipt.source.toLowerCase().includes("order") || receipt.source.toLowerCase().includes("report") ? "Ops" : "Audit",
    action: receipt.source,
    amount: dollars(receipt.amountCents),
    vendor: receipt.externalId ?? receipt.source,
    decision: receipt.decision as DashboardReceipt["decision"],
    status: statusFromDecision(receipt.decision),
    reason: receipt.note,
    matchedPolicy: receipt.externalId ? "external_event_recorded" : "receipt_required",
    proof: proofFor(receipt.id),
    mode: receipt.businessRun?.mode === "stripe_test" ? "test" : "shadow"
  }));

  const decisionRows: DashboardReceipt[] = decisions.map((decision) => ({
    id: decision.id,
    timestamp: decision.createdAt.toISOString(),
    agent: "Risk",
    action: `Policy decision for ${decision.spendRequestRef}`,
    amount: dollars(decision.remainingCents < 0 ? 0 : 0),
    vendor: decision.spendRequestRef,
    decision: decision.decision as DashboardReceipt["decision"],
    status: statusFromDecision(decision.decision),
    reason: decision.reason,
    matchedPolicy: JSON.parse(decision.matchedRulesJson || "[]").join(", ") || "policy_evaluated",
    proof: proofFor(decision.id),
    mode: decision.businessRun?.mode === "stripe_test" ? "test" : "shadow"
  }));

  return [...receiptRows, ...decisionRows].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export async function getDashboardPnl(): Promise<DashboardPnl> {
  const run = await getLatestRun();

  if (!run) {
    return {
      revenue: 0,
      approvedCosts: 0,
      blockedRiskySpend: 0,
      netProfit: 0,
      grossMargin: 0,
      totalBudget: 0,
      budgetUsed: 0,
      budgetRemaining: 0,
      customerCount: 0,
      fulfillmentStatus: "No orders yet",
      nextRecommendedAction: "Create a Stripe test checkout or run explicit demo mode to populate the control tower.",
      summary: "No live business records yet. The control tower is waiting for a Stripe test checkout, order, spend decision, or explicit demo run.",
      hasData: false
    };
  }

  const [revenueAgg, approvedCostAgg, blockedAgg, customerCount, deliveredCount] = await Promise.all([
    prisma.customerOrder.aggregate({ _sum: { amountCents: true }, where: { businessRunId: run.id, status: { in: ["paid", "delivered", "demo_paid"] } } }),
    prisma.spendRequest.aggregate({ _sum: { amountCents: true }, where: { businessRunId: run.id, status: "approved" } }),
    prisma.spendRequest.aggregate({ _sum: { amountCents: true }, where: { businessRunId: run.id, status: "blocked" } }),
    prisma.customerOrder.count({ where: { businessRunId: run.id } }),
    prisma.customerOrder.count({ where: { businessRunId: run.id, status: "delivered" } })
  ]);

  const revenue = dollars(revenueAgg._sum.amountCents ?? run.revenueCents ?? 0);
  const approvedCosts = dollars(approvedCostAgg._sum.amountCents ?? run.costCents ?? 0);
  const blockedRiskySpend = dollars(blockedAgg._sum.amountCents ?? run.blockedRiskCents ?? 0);
  const totalBudget = dollars(run.budgetCents ?? 0);
  const netProfit = revenue - approvedCosts;
  const budgetRemaining = Math.max(totalBudget - approvedCosts, 0);
  const hasData = Boolean(run || customerCount > 0 || revenue || approvedCosts || blockedRiskySpend);

  return {
    revenue,
    approvedCosts,
    blockedRiskySpend,
    netProfit,
    grossMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    totalBudget,
    budgetUsed: approvedCosts,
    budgetRemaining,
    customerCount,
    fulfillmentStatus: deliveredCount > 0 ? `${deliveredCount} delivered` : customerCount > 0 ? "Awaiting fulfillment" : "No orders yet",
    nextRecommendedAction: hasData ? "Review live receipts, fulfill paid orders, then run the next bounded growth experiment." : "Create a Stripe test checkout or run explicit demo mode to populate the control tower.",
    summary: hasData
      ? `Latest run ${run.id} shows $${revenue.toFixed(2)} revenue, $${approvedCosts.toFixed(2)} approved costs, $${blockedRiskySpend.toFixed(2)} blocked risk, and $${netProfit.toFixed(2)} profit.`
      : "No live business records yet. The control tower is waiting for a Stripe test checkout, order, spend decision, or explicit demo run.",
    hasData
  };
}
export function getRuntimeStatusPayload() {
  return getRuntimeConfig().safeStatus;
}





