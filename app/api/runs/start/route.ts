import { NextResponse } from "next/server";
import { z } from "zod";
import { startBusinessRun } from "@/lib/runs/start-business-run";

export const dynamic = "force-dynamic";

const startRunSchema = z.object({
  goal: z.string().min(10),
  budgetCents: z.number().int().positive(),
  customerEmail: z.string().email().optional(),
  mode: z.literal("stripe_test").default("stripe_test")
});

export async function POST(request: Request) {
  try {
    const input = startRunSchema.parse(await request.json());
    const result = await startBusinessRun(input);
    return NextResponse.json({ run: result.run, checkout: result.checkout });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues.map((issue) => issue.message).join(", ") : error instanceof Error ? error.message : "Unable to start business run";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

