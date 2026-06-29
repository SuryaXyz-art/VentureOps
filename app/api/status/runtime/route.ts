import { NextResponse } from "next/server";
import { getRuntimeStatusPayload } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getRuntimeStatusPayload());
}