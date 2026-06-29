import { NextResponse } from "next/server";
import { getDashboardOrders } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? undefined;
  return NextResponse.json({ orders: await getDashboardOrders({ sessionId }) });
}
