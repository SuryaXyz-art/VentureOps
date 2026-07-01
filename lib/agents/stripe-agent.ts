import type { BusinessPlan, StripePreparation } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";

export function runStripeAgent(plan: BusinessPlan) {
  const stripe: StripePreparation = {
    productName: plan.offerName,
    price: plan.priceRecommendation,
    checkoutDescription: "48-hour AI-assisted research report for Web3 founders. Includes market map, competitor scan, risk notes, and launch memo.",
    customerRecordPlaceholder: {
      name: "Demo Web3 Founder",
      email: "founder@example.com",
      segment: "Web3 founder"
    }
  };

  return createAgentEvent({
    id: "evt_stripe_prepare",
    role: "Stripe",
    title: "Stripe agent prepares paid offer",
    detail: `${stripe.productName} prepared at $${stripe.price} with a test customer record prepared for checkout reconciliation.`,
    status: "approved",
    amount: stripe.price,
    action: "prepare_stripe_offer",
    decision: "approved",
    reason: "No live Stripe call is made in Phase 2; this is a deterministic offer preparation event.",
    policyMatched: "phase_2_no_external_stripe_calls",
    payload: stripe
  });
}
