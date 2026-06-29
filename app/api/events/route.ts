import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getDashboardEvents } from "@/lib/data/dashboard";

export async function GET() {
  return NextResponse.json({ events: await getDashboardEvents() });
}


