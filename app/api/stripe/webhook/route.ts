import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getRuntimeConfig } from "@/lib/config/runtime";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe/client";
import { RESEARCH_REPORT_PRODUCT } from "@/lib/stripe/products";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const payload = await request.text();
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const runtime = getRuntimeConfig();

  if (!stripe || !webhookSecret || !signature) {
    if (!runtime.demoMode) {
      return NextResponse.json({ error: "Stripe webhook is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET or enable DEMO_MODE=true." }, { status: 503 });
    }

    await prisma.stripeEvent.create({
      data: {
        stripeEventId: `demo_evt_${Date.now()}`,
        type: "demo.webhook.received",
        payloadJson: payload || "{}"
      }
    }).catch(() => undefined);

    return NextResponse.json({ received: true, mode: "demo" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid Stripe webhook signature" }, { status: 400 });
  }

  await prisma.stripeEvent.upsert({
    where: { stripeEventId: event.id },
    update: { type: event.type, payloadJson: JSON.stringify(event) },
    create: {
      stripeEventId: event.id,
      type: event.type,
      payloadJson: JSON.stringify(event)
    }
  });

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as {
      id: string;
      amount_total?: number | null;
      currency?: string | null;
      customer?: string | null;
      customer_email?: string | null;
      client_reference_id?: string | null;
      metadata?: { orderId?: string; businessRunId?: string; productName?: string } | null;
      customer_details?: { email?: string | null; name?: string | null } | null;
    };

    const amount = checkoutSession.amount_total ?? RESEARCH_REPORT_PRODUCT.unitAmount;
    const order = await prisma.customerOrder.findFirst({
      where: {
        OR: [
          { stripeCheckoutId: checkoutSession.id },
          { id: checkoutSession.metadata?.orderId ?? checkoutSession.client_reference_id ?? "" }
        ]
      }
    });

    if (!order) {
      return NextResponse.json({ received: true, mode: "stripe", type: event.type, reconciled: false, reason: "order_not_found" });
    }

    const businessRunId = order.businessRunId ?? checkoutSession.metadata?.businessRunId ?? undefined;
    await prisma.customerOrder.update({
      where: { id: order.id },
      data: {
        status: "paid",
        amountCents: amount,
        currency: checkoutSession.currency ?? order.currency,
        customerEmail: checkoutSession.customer_details?.email ?? checkoutSession.customer_email ?? order.customerEmail,
        customerName: checkoutSession.customer_details?.name ?? order.customerName,
        stripeCustomerId: typeof checkoutSession.customer === "string" ? checkoutSession.customer : order.stripeCustomerId,
        stripeCheckoutId: checkoutSession.id
      }
    });

    if (businessRunId) {
      const approvedCosts = await prisma.spendRequest.aggregate({ _sum: { amountCents: true }, where: { businessRunId, status: "approved" } });
      const blockedRisk = await prisma.spendRequest.aggregate({ _sum: { amountCents: true }, where: { businessRunId, status: "blocked" } });
      const costCents = approvedCosts._sum.amountCents ?? 0;
      const blockedRiskCents = blockedRisk._sum.amountCents ?? 0;

      await prisma.businessRun.update({
        where: { id: businessRunId },
        data: {
          status: "paid",
          revenueCents: amount,
          costCents,
          blockedRiskCents,
          profitCents: amount - costCents
        }
      });

      await prisma.receipt.create({
        data: {
          businessRunId,
          source: "Stripe Checkout",
          amountCents: amount,
          decision: "recorded",
          note: `Stripe checkout.session.completed reconciled session ${checkoutSession.id} to order ${order.id}.`,
          externalId: checkoutSession.id
        }
      });

      await prisma.agentEvent.create({
        data: {
          businessRunId,
          role: "Stripe",
          title: "Checkout completed",
          detail: `Stripe Checkout session ${checkoutSession.id} paid order ${order.id}.`,
          status: "complete",
          amountCents: amount
        }
      });

      const latestReport = await prisma.profitLossReport.findFirst({ where: { businessRunId }, orderBy: { createdAt: "desc" } });
      const pnlData = {
        revenueCents: amount,
        costCents,
        profitCents: amount - costCents,
        blockedRiskCents,
        notes: `Reconciled from Stripe Checkout session ${checkoutSession.id}.`
      };
      if (latestReport) {
        await prisma.profitLossReport.update({ where: { id: latestReport.id }, data: pnlData });
      } else {
        await prisma.profitLossReport.create({ data: { businessRunId, ...pnlData } });
      }
    }

    return NextResponse.json({ received: true, mode: "stripe", type: event.type, reconciled: true, orderId: order.id });
  }

  return NextResponse.json({ received: true, mode: "stripe", type: event.type });
}

