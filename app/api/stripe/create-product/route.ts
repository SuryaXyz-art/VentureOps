import { NextResponse } from "next/server";
import { createResearchReportProduct } from "@/lib/stripe/products";

export async function POST() {
  try {
    const product = await createResearchReportProduct();
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product" },
      { status: 500 }
    );
  }
}
