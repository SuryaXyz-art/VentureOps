import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDashboardPnl } from "@/lib/data/dashboard";

export async function GET() {
  return NextResponse.json({ pnl: await getDashboardPnl() });
}


