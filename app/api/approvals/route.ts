import { NextResponse } from "next/server";
import { getApprovalQueue } from "@/lib/approvals/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ approvals: await getApprovalQueue() });
}
