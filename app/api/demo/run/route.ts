import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config/runtime";
import { runAgentWorkflowWithLlm } from "@/lib/agents/orchestrator-llm";
import { demoGoal } from "@/lib/demo/scenario";
import { generateCustomerReport } from "@/lib/fulfillment/report-generator";

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo workflow is disabled because DEMO_MODE=false. Use live Stripe test data instead." }, { status: 403 });
  }
  return NextResponse.json(await runJudgeWorkflow());
}

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo workflow is disabled because DEMO_MODE=false. Use live Stripe test data instead." }, { status: 403 });
  }
  return NextResponse.json(await runJudgeWorkflow());
}

async function runJudgeWorkflow() {
  const workflow = await runAgentWorkflowWithLlm(demoGoal, 25);
  const generatedReport = await generateCustomerReport({
    orderId: "judge-demo-order-001",
    customerName: "Demo Web3 Founder",
    customerEmail: "founder@example.com",
    productName: workflow.stripe.productName,
    goal: demoGoal
  });

  return {
    ...workflow,
    generatedReport
  };
}
