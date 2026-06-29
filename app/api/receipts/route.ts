import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDashboardReceipts } from "@/lib/data/dashboard";

export async function GET() {
  return NextResponse.json({ receipts: await getDashboardReceipts() });
}


