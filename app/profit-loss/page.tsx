"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeDollarSign, RefreshCw, ShieldX, Users } from "lucide-react";
import { AnimatedMetric } from "@/components/profit-loss/animated-metric";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PnlSnapshot = {
  revenue: number;
  approvedCosts: number;
  blockedRiskySpend: number;
  netProfit: number;
  grossMargin: number;
  totalBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  customerCount: number;
  fulfillmentStatus: string;
  nextRecommendedAction: string;
  summary: string;
  hasData: boolean;
};

type RuntimeStatus = { mode: "demo" | "live_test" };

const emptyPnl: PnlSnapshot = {
  revenue: 0,
  approvedCosts: 0,
  blockedRiskySpend: 0,
  netProfit: 0,
  grossMargin: 0,
  totalBudget: 0,
  budgetUsed: 0,
  budgetRemaining: 0,
  customerCount: 0,
  fulfillmentStatus: "No orders yet",
  nextRecommendedAction: "Create a Stripe test checkout or run explicit demo mode to populate the control tower.",
  summary: "No live business records yet. The control tower is waiting for a Stripe test checkout, order, spend decision, or explicit demo run.",
  hasData: false
};

const icons = [BadgeDollarSign, ArrowUpRight, ShieldX, BadgeDollarSign, ArrowUpRight, ArrowUpRight, BadgeDollarSign, Users];

export default function ProfitLossPage() {
  const [pnl, setPnl] = useState<PnlSnapshot>(emptyPnl);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
      setLoading(true);
      try {
        const [pnlResponse, runtimeResponse] = await Promise.all([
          fetch("/api/pnl", { cache: "no-store" }),
          fetch("/api/status/runtime", { cache: "no-store" })
        ]);
        if (!pnlResponse.ok) throw new Error("Unable to load P&L data");
        setPnl(((await pnlResponse.json()) as { pnl: PnlSnapshot }).pnl);
        setRuntime(await runtimeResponse.json() as RuntimeStatus);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load P&L data");
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(id);
  }, []);

  const metrics = [
    { label: "Revenue", value: pnl.revenue, prefix: "$" },
    { label: "Approved costs", value: pnl.approvedCosts, prefix: "$" },
    { label: "Blocked risky spend", value: pnl.blockedRiskySpend, prefix: "$" },
    { label: "Net profit", value: pnl.netProfit, prefix: "$" },
    { label: "Gross margin", value: pnl.grossMargin, suffix: "%", decimals: 1 },
    { label: "Budget used", value: pnl.budgetUsed, prefix: "$" },
    { label: "Budget remaining", value: pnl.budgetRemaining, prefix: "$" },
    { label: "Customer count", value: pnl.customerCount }
  ];
  const budgetPct = pnl.totalBudget > 0 ? Math.min((pnl.budgetUsed / pnl.totalBudget) * 100, 100) : 0;

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>P&L Dashboard</Badge>{runtime ? (runtime.mode === "live_test" ? <Badge>Live test mode</Badge> : <Badge>Demo fallback enabled</Badge>) : <Badge>Checking runtime...</Badge>}</div>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">Judge-facing business outcome.</h1>
          <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><p className="max-w-4xl text-lg leading-8 text-muted-foreground">{loading ? "Loading live P&L from Prisma..." : pnl.summary}</p><Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="size-4" /> Refresh from DB</Button></div>
          {error ? <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        </Card>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = icons[index];
            return <Card key={metric.label} className="p-4"><div className="flex items-center justify-between gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="size-5" /></div><Badge>{metric.label}</Badge></div><p className="mt-5 text-3xl font-semibold"><AnimatedMetric value={metric.value} prefix={metric.prefix} suffix={metric.suffix} decimals={metric.decimals} /></p></Card>;
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader><CardTitle>Budget Control</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-sm text-muted-foreground"><span>Budget used</span><span>${pnl.budgetUsed.toFixed(2)} of ${pnl.totalBudget.toFixed(2)}</span></div>
              <div className="h-4 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${budgetPct}%` }} /></div>
              <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Fulfillment status</p><p className="mt-1 font-semibold">{pnl.fulfillmentStatus}</p></div><div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Budget remaining</p><p className="mt-1 font-semibold">${pnl.budgetRemaining.toFixed(2)}</p></div></div>
            </CardContent>
          </Card>
          <Card className="border-primary/30"><CardHeader><CardTitle>Next Recommended Action</CardTitle></CardHeader><CardContent><p className="text-lg leading-8 text-muted-foreground">{pnl.nextRecommendedAction}</p></CardContent></Card>
        </div>
      </section>
    </main>
  );
}


