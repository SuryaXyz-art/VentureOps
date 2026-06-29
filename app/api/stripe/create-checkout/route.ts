import { NextResponse } from "next/server";
import { z } from "zod";
import { createResearchReportCheckout } from "@/lib/stripe/checkout";
import { RESEARCH_REPORT_PRODUCT } from "@/lib/stripe/products";

const checkoutSchema = z.object({
  customerEmail: z.string().email().default("founder@example.com"),
  customerName: z.string().min(1).max(120).optional(),
  productName: z.string().min(1).max(180).default(RESEARCH_REPORT_PRODUCT.name),
  amountCents: z.number().int().positive().max(500000).default(RESEARCH_REPORT_PRODUCT.unitAmount),
  businessRunId: z.string().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = checkoutSchema.parse(body);
    const checkout = await createResearchReportCheckout(input);
    return NextResponse.json(checkout);
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues.map((issue) => issue.message).join(", ") : error instanceof Error ? error.message : "Unable to create checkout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
