import { getRuntimeConfig, requireLiveConfig } from "@/lib/config/runtime";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getStripeClient } from "@/lib/stripe/client";
import { createResearchReportProduct, RESEARCH_REPORT_PRODUCT } from "@/lib/stripe/products";

export interface CheckoutInput {
  customerEmail: string;
  customerName?: string;
  productName?: string;
  amountCents?: number;
  businessRunId?: string;
}

export interface CheckoutResult {
  mode: "stripe" | "demo";
  checkoutUrl: string;
  sessionId: string;
  orderId?: string;
  businessRunId?: string;
  productId?: string;
  priceId?: string;
  productName: string;
  amount: number;
}

async function getOrCreateBusinessRun(input: CheckoutInput) {
  if (input.businessRunId) {
    const existing = await prisma.businessRun.findUnique({ where: { id: input.businessRunId } });
    if (existing) return existing;
  }

  const active = await prisma.businessRun.findFirst({
    where: { mode: "stripe_test", status: { in: ["created", "checkout_created", "running"] } },
    orderBy: { createdAt: "desc" }
  });
  if (active) return active;

  return prisma.businessRun.create({
    data: {
      goal: "Stripe test checkout for AI Web3 Founder Research Report",
      mode: "stripe_test",
      status: "checkout_created",
      budgetCents: 2500
    }
  });
}

async function recordDemoOrder(input: CheckoutInput) {
  const productName = input.productName ?? RESEARCH_REPORT_PRODUCT.name;
  const amountCents = input.amountCents ?? RESEARCH_REPORT_PRODUCT.unitAmount;
  const run = input.businessRunId
    ? await prisma.businessRun.update({
        where: { id: input.businessRunId },
        data: {
          status: "checkout_completed",
          revenueCents: amountCents,
          profitCents: amountCents,
          customerOrders: {
            create: {
              customerEmail: input.customerEmail,
              customerName: input.customerName,
              productName,
              amountCents,
              status: "paid",
              mode: "demo",
              stripeCheckoutId: "cs_demo_ai_web3_report"
            }
          },
          receipts: {
            create: {
              source: "Demo Checkout",
              amountCents,
              decision: "recorded",
              note: "Demo checkout completed without Stripe keys.",
              externalId: "cs_demo_ai_web3_report"
            }
          },
          agentEvents: {
            create: {
              role: "Stripe",
              title: "Demo checkout completed",
              detail: "Demo checkout fallback created a paid order because DEMO_MODE=true.",
              status: "complete",
              amountCents
            }
          }
        },
        include: { customerOrders: { orderBy: { createdAt: "desc" }, take: 1 } }
      })
    : await prisma.businessRun.create({
        data: {
          goal: "Stripe revenue demo for AI Web3 Founder Research Report",
          mode: "demo",
          status: "checkout_completed",
          revenueCents: amountCents,
          profitCents: amountCents,
          customerOrders: {
            create: {
              customerEmail: input.customerEmail,
              customerName: input.customerName,
              productName,
              amountCents,
              status: "paid",
              mode: "demo",
              stripeCheckoutId: "cs_demo_ai_web3_report"
            }
          },
          receipts: {
            create: {
              source: "Demo Checkout",
              amountCents,
              decision: "recorded",
              note: "Demo checkout completed without Stripe keys.",
              externalId: "cs_demo_ai_web3_report"
            }
          },
          agentEvents: {
            create: {
              role: "Stripe",
              title: "Demo checkout completed",
              detail: "Demo checkout fallback created a paid order because DEMO_MODE=true.",
              status: "complete",
              amountCents
            }
          },
          profitLossReports: {
            create: {
              revenueCents: amountCents,
              costCents: 0,
              profitCents: amountCents,
              blockedRiskCents: 0,
              notes: "Demo fallback revenue event."
            }
          }
        },
        include: { customerOrders: true }
      });

  return { run, order: run.customerOrders[0] };
}
export async function createResearchReportCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const productName = input.productName ?? RESEARCH_REPORT_PRODUCT.name;
  const amountCents = input.amountCents ?? RESEARCH_REPORT_PRODUCT.unitAmount;

  if (!stripe) {
    const runtime = getRuntimeConfig();
    if (!runtime.demoMode) {
      requireLiveConfig("stripe");
    }
    const { run, order } = await recordDemoOrder(input);
    return {
      mode: "demo",
      checkoutUrl: `${appUrl}/success?demo=true&session_id=cs_demo_ai_web3_report&orderId=${order.id}`,
      sessionId: "cs_demo_ai_web3_report",
      orderId: order.id,
      businessRunId: run.id,
      productId: "prod_demo_ai_web3_report",
      priceId: "price_demo_1900",
      productName,
      amount: amountCents
    };
  }

  const run = await getOrCreateBusinessRun(input);
  const product = await createResearchReportProduct({ productName, amountCents });
  const order = await prisma.customerOrder.create({
    data: {
      businessRunId: run.id,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      productName,
      amountCents,
      status: "checkout_created",
      mode: "stripe_test"
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: product.priceId, quantity: 1 }],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel`,
    customer_email: input.customerEmail,
    client_reference_id: order.id,
    metadata: {
      app: "ventureops-autopilot",
      businessRunId: run.id,
      orderId: order.id,
      productName
    }
  });

  await prisma.customerOrder.update({ where: { id: order.id }, data: { stripeCheckoutId: session.id } });
  await prisma.businessRun.update({ where: { id: run.id }, data: { status: "checkout_created" } });
  await prisma.agentEvent.create({
    data: {
      businessRunId: run.id,
      role: "Stripe",
      title: "Checkout session created",
      detail: `Stripe Checkout session ${session.id} created for ${input.customerEmail}.`,
      status: "checkout_created",
      amountCents
    }
  });

  return {
    mode: "stripe",
    checkoutUrl: session.url ?? `${appUrl}/success?session_id=${session.id}`,
    sessionId: session.id,
    orderId: order.id,
    businessRunId: run.id,
    productId: product.productId,
    priceId: product.priceId,
    productName,
    amount: amountCents
  };
}

