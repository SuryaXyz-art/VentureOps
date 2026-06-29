import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config/runtime";
import { generateCustomerReport } from "@/lib/fulfillment/report-generator";
import { prisma } from "@/lib/prisma";

const productName = "AI Web3 Founder Research Report";

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo order creation is disabled because DEMO_MODE=false." }, { status: 403 });
  }
  const report = await generateCustomerReport({
    customerName: "Demo Web3 Founder",
    customerEmail: "founder@example.com",
    productName
  });

  try {
    const run = await prisma.businessRun.create({
      data: {
        goal: "Fulfill paid AI Web3 Founder Research Report order",
        mode: "demo",
        status: "fulfilled",
        revenueCents: 1900,
        profitCents: 1900,
        customerOrders: {
          create: {
            customerName: "Demo Web3 Founder",
            customerEmail: "founder@example.com",
            productName,
            amountCents: 1900,
            status: "delivered",
            mode: "demo"
          }
        },
        agentEvents: {
          create: [
            { role: "Stripe", title: "Order received", detail: "Demo paid order recorded for fulfillment.", status: "complete", amountCents: 1900 },
            { role: "Ops", title: "Report generated", detail: "Ops Agent generated the customer research report.", status: "fulfilled" },
            { role: "Audit", title: "Delivery recorded", detail: "Audit Agent recorded delivered-to-customer status.", status: "audited" }
          ]
        },
        receipts: {
          create: {
            source: "Demo Customer Order",
            amountCents: 1900,
            decision: "recorded",
            note: "Customer order created and fulfilled with generated report."
          }
        }
      },
      include: { customerOrders: true }
    });

    const order = run.customerOrders[0];
    const savedReport = await prisma.fulfillmentReport.create({
      data: {
        businessRunId: run.id,
        orderId: order.id,
        title: report.title,
        markdown: report.markdown,
        sectionsJson: JSON.stringify(report.sections),
        status: "delivered",
        provider: report.provider
      }
    });

    return NextResponse.json({
      order: { ...order, status: "delivered" },
      report: { id: savedReport.id, title: savedReport.title, status: savedReport.status, provider: savedReport.provider },
      reportUrl: `/reports/${savedReport.id}`
    });
  } catch {
    return NextResponse.json({
      order: {
        id: "demo_order_fallback",
        customerName: "Demo Web3 Founder",
        customerEmail: "founder@example.com",
        productName,
        amountCents: 1900,
        status: "delivered",
        mode: "demo"
      },
      report: { id: "demo-report", title: report.title, status: "delivered", provider: report.provider, markdown: report.markdown, sections: report.sections },
      reportUrl: "/reports/demo-report"
    });
  }
}


