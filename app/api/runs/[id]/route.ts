import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const run = await prisma.businessRun.findUnique({
    where: { id: params.id },
    include: { agentEvents: { orderBy: { createdAt: "asc" } }, customerOrders: true, spendRequests: true, policyDecisions: true, receipts: true, stripeEvents: true, profitLossReports: true, fulfillmentReports: true }
  });
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  return NextResponse.json({ run });
}
