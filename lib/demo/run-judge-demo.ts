import type { DemoRun } from "@/lib/agents/types";
import { seededDemoRun } from "@/lib/demo/scenario";
import { createDemoOffer } from "@/lib/stripe/create-demo-offer";

export async function runJudgeDemo(goal: string): Promise<DemoRun> {
  const offer = await createDemoOffer();

  return {
    ...seededDemoRun,
    goal,
    checkoutUrl: offer.checkoutUrl,
    events: seededDemoRun.events.map((event) =>
      event.id === "stripe-offer"
        ? {
            ...event,
            detail: `Product, price, customer, and checkout link ready in ${offer.mode} mode.`
          }
        : event
    ),
    receipts: seededDemoRun.receipts.map((receipt) =>
      receipt.id === "receipt_stripe_01"
        ? {
            ...receipt,
            source: offer.mode === "stripe" ? "Stripe Payment Link" : "Demo Stripe Fallback",
            note: `Created product, price, customer, and checkout link: ${offer.checkoutUrl}`
          }
        : receipt
    )
  };
}
