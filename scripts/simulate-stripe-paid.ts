import Stripe from "stripe";
import { prisma } from "../lib/prisma";

async function main() {
  const order = await prisma.customerOrder.findFirst({
    where: { status: "checkout_created", stripeCheckoutId: { not: null } },
    orderBy: { createdAt: "desc" }
  });

  if (!order?.stripeCheckoutId) {
    throw new Error("No checkout_created order with stripeCheckoutId found.");
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  if (!secret || !webhookSecret) {
    throw new Error("Stripe keys are required.");
  }

  const stripe = new Stripe(secret);
  const event = {
    id: `evt_sim_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: order.stripeCheckoutId,
        object: "checkout.session",
        amount_total: order.amountCents,
        currency: "usd",
        customer_email: order.customerEmail,
        client_reference_id: order.id,
        metadata: {
          orderId: order.id,
          businessRunId: order.businessRunId ?? "",
          productName: order.productName
        },
        customer_details: {
          email: order.customerEmail,
          name: order.customerName
        }
      }
    }
  };

  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret
  });

  const response = await fetch(`${appUrl}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature
    },
    body: payload
  });

  const body = await response.text();
  console.log("webhook_status", response.status);
  console.log("webhook_body", body);

  const updated = await prisma.customerOrder.findUnique({ where: { id: order.id } });
  console.log("order_status", updated?.status);
}

main().catch((error) => {
  console.error("simulate_paid_failed", error instanceof Error ? error.message : error);
  process.exit(1);
});