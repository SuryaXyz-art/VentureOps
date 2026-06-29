import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getLatestRun } from "@/lib/data/dashboard";

export async function GET() {
  const run = await getLatestRun();
  return NextResponse.json({ run });
}


