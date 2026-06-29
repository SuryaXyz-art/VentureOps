import { NextResponse } from "next/server";
import { resolveApproval } from "@/lib/approvals/queue";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ decision: await resolveApproval(params.id, "reject") });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reject request" }, { status: 400 });
  }
}