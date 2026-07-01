import { NextResponse } from "next/server";
import { generateCustomerReport } from "@/lib/fulfillment/report-generator";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderId?: string };

  let order: { id: string; customerName: string | null; customerEmail: string | null; productName: string; businessRunId?: string | null } | null = null;

  if (body.orderId) {
    try {
      order = await prisma.customerOrder.findUnique({
        where: { id: body.orderId },
        select: { id: true, customerName: true, customerEmail: true, productName: true, businessRunId: true }
      });
    } catch {
      order = null;
    }
  }

  if (order) {
    const existing = await prisma.fulfillmentReport.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: "desc" } });
    if (existing) {
      return NextResponse.json({ report: { id: existing.id, title: existing.title, status: existing.status, provider: existing.provider }, reportUrl: `/reports/${existing.id}` });
    }
  }

  const report = await generateCustomerReport({
    orderId: order?.id ?? body.orderId,
    customerName: order?.customerName ?? "Demo Web3 Founder",
    customerEmail: order?.customerEmail ?? "founder@example.com",
    productName: order?.productName ?? "AI Web3 Founder Research Report"
  });

  if (!order) {
    return NextResponse.json({ report: { id: "generated-preview", ...report, status: "delivered" }, reportUrl: "/reports/demo-report" });
  }

  try {
    const saved = await prisma.fulfillmentReport.create({
      data: {
        businessRunId: order.businessRunId,
        orderId: order.id,
        title: report.title,
        markdown: report.markdown,
        sectionsJson: JSON.stringify(report.sections),
        status: "delivered",
        provider: report.provider
      }
    });
    await prisma.customerOrder.update({ where: { id: order.id }, data: { status: "delivered" } });
    return NextResponse.json({ report: { id: saved.id, title: saved.title, status: saved.status, provider: saved.provider }, reportUrl: `/reports/${saved.id}` });
  } catch {
    return NextResponse.json({ report: { id: "generated-preview", ...report, status: "delivered" }, reportUrl: "/reports/demo-report" });
  }
}

