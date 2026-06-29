import { getHermesBaseUrl, getHermesModel, getHermesTelemetry } from "@/lib/llm/hermes";
import { prisma } from "@/lib/prisma";
import { getRuntimeConfig } from "@/lib/config/runtime";
import { getDashboardPnl, getDashboardReceipts, getLatestRun } from "@/lib/data/dashboard";

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

export async function getProofSnapshot() {
  const [run, pnl, receipts, latestOrder, latestStripeEvent] = await Promise.all([
    getLatestRun(),
    getDashboardPnl(),
    getDashboardReceipts(),
    prisma.customerOrder.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.stripeEvent.findFirst({ orderBy: { createdAt: "desc" } })
  ]);
  const runtime = getRuntimeConfig();
  const hermes = getHermesTelemetry();
  const runOrder = run?.customerOrders[0] ?? latestOrder;
  const runStripeEvent = run?.stripeEvents[0] ?? latestStripeEvent;
  const receiptsCount = run?.receipts.length ?? receipts.length;

  return {
    runtime: runtime.safeStatus,
    run,
    pnl,
    receipts,
    stripe: {
      configured: runtime.stripeConfigured,
      latestSessionId: runOrder?.stripeCheckoutId ?? null,
      latestOrderId: runOrder?.id ?? null,
      latestOrderStatus: runOrder?.status ?? null,
      latestWebhookEventId: runStripeEvent?.stripeEventId ?? null,
      latestWebhookEventType: runStripeEvent?.type ?? null
    },
    hermes: {
      provider: runtime.llmProvider,
      model: runtime.llmProvider === "hermes" ? getHermesModel() : "mock",
      baseUrlHost: runtime.llmProvider === "hermes" ? safeHost(getHermesBaseUrl()) : null,
      connected: runtime.llmProvider === "hermes" ? hermes.connected : true,
      lastError: hermes.lastError ?? null,
      lastResponseId: hermes.lastResponseId ?? null,
      lastContentPreview: hermes.lastContentPreview ?? null
    },
    proof: {
      businessRunId: run?.id ?? null,
      stripeCheckoutSessionId: runOrder?.stripeCheckoutId ?? null,
      stripeEventId: runStripeEvent?.stripeEventId ?? null,
      receiptsCount,
      blockedSpendAmount: pnl.blockedRiskySpend,
      netProfit: pnl.netProfit
    }
  };
}
