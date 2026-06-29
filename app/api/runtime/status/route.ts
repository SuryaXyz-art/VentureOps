import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getRuntimeStatusPayload } from "@/lib/data/dashboard";

export async function GET() {
  return NextResponse.json(getRuntimeStatusPayload());
}


