import { prisma } from "@/lib/prisma";

export type ApprovalQueueItem = {
  id: string;
  businessRunId: string | null;
  spendRequestRef: string;
  vendor: string;
  amountCents: number;
  category: string;
  reason: string;
  riskLevel: string;
  decision: string;
  matchedRules: string[];
  remainingCents: number;
  receiptRequired: boolean;
  riskScore: number;
  createdAt: string;
};

function parseRules(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function getApprovalQueue(): Promise<ApprovalQueueItem[]> {
  const decisions = await prisma.policyDecision.findMany({
    where: { decision: "needs_approval" },
    orderBy: { createdAt: "desc" }
  });
  const spendRefs = decisions.map((decision) => decision.spendRequestRef);
  const requests = await prisma.spendRequest.findMany({ where: { id: { in: spendRefs } } });
  const requestById = new Map(requests.map((request) => [request.id, request]));

  return decisions.map((decision) => {
    const request = requestById.get(decision.spendRequestRef);
    return {
      id: decision.id,
      businessRunId: decision.businessRunId,
      spendRequestRef: decision.spendRequestRef,
      vendor: request?.vendor ?? decision.spendRequestRef,
      amountCents: request?.amountCents ?? 0,
      category: request?.category ?? "unknown",
      reason: request?.reason ?? decision.reason,
      riskLevel: request?.riskLevel ?? "medium",
      decision: decision.decision,
      matchedRules: parseRules(decision.matchedRulesJson),
      remainingCents: decision.remainingCents,
      receiptRequired: decision.receiptRequired,
      riskScore: decision.riskScore,
      createdAt: decision.createdAt.toISOString()
    };
  });
}

async function recomputeRunTotals(businessRunId: string) {
  const run = await prisma.businessRun.findUnique({ where: { id: businessRunId } });
  const approved = await prisma.spendRequest.aggregate({ _sum: { amountCents: true }, where: { businessRunId, status: "approved" } });
  const blocked = await prisma.spendRequest.aggregate({ _sum: { amountCents: true }, where: { businessRunId, status: "blocked" } });
  const costCents = approved._sum.amountCents ?? 0;
  const blockedRiskCents = blocked._sum.amountCents ?? 0;
  const revenueCents = run?.revenueCents ?? 0;
  await prisma.businessRun.update({ where: { id: businessRunId }, data: { costCents, blockedRiskCents, profitCents: revenueCents - costCents } });

  const latestReport = await prisma.profitLossReport.findFirst({ where: { businessRunId }, orderBy: { createdAt: "desc" } });
  const data = {
    revenueCents,
    costCents,
    profitCents: revenueCents - costCents,
    blockedRiskCents,
    notes: "Updated after founder approval queue action."
  };
  if (latestReport) await prisma.profitLossReport.update({ where: { id: latestReport.id }, data });
  else await prisma.profitLossReport.create({ data: { businessRunId, ...data } });
}

export async function resolveApproval(id: string, action: "approve" | "reject") {
  const decision = await prisma.policyDecision.findUnique({ where: { id } });
  if (!decision) throw new Error("Approval request not found.");
  if (decision.decision !== "needs_approval") throw new Error(`Approval request already resolved as ${decision.decision}.`);

  const request = await prisma.spendRequest.findUnique({ where: { id: decision.spendRequestRef } });
  if (!request || !decision.businessRunId) throw new Error("Linked spend request or business run was not found.");

  const finalDecision = action === "approve" ? "approved" : "blocked";
  const title = action === "approve" ? "Founder approved spend" : "Founder rejected spend";
  const note = action === "approve"
    ? `Founder approved ${request.vendor} spend from approval queue.`
    : `Founder rejected ${request.vendor} spend from approval queue.`;

  await prisma.$transaction([
    prisma.policyDecision.update({ where: { id }, data: { decision: finalDecision, reason: `${decision.reason} Founder ${action === "approve" ? "approved" : "rejected"} this request.` } }),
    prisma.spendRequest.update({ where: { id: request.id }, data: { status: finalDecision } }),
    prisma.receipt.create({ data: { businessRunId: decision.businessRunId, source: request.vendor, amountCents: request.amountCents, decision: finalDecision, note, externalId: request.id } }),
    prisma.agentEvent.create({ data: { businessRunId: decision.businessRunId, role: "Audit", title, detail: note, status: finalDecision === "approved" ? "approved" : "blocked", amountCents: request.amountCents, payloadJson: JSON.stringify({ approvalId: id, spendRequestId: request.id, finalDecision }) } })
  ]);

  await recomputeRunTotals(decision.businessRunId);
  return prisma.policyDecision.findUnique({ where: { id } });
}
