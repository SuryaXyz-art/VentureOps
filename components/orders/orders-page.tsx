"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, PackageCheck, Play, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderRow = {
  id: string;
  customerName?: string | null;
  customerEmail?: string | null;
  productName: string;
  amountCents: number;
  status: string;
  mode?: string;
  reportUrl?: `/reports/${string}` | null;
};

type RuntimeStatus = {
  demoMode: boolean;
  mode: "demo" | "live_test";
};

const timeline = [
  "Stripe Agent records paid order",
  "Ops Agent generates Web3 Founder Market Signal Report",
  "Risk Agent confirms safe data sources",
  "Audit Agent records delivery receipt",
  "Customer status changes to delivered"
];

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders(showLoading = false) {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [ordersResponse, runtimeResponse] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/status/runtime", { cache: "no-store" })
      ]);
      if (!ordersResponse.ok) throw new Error("Unable to load orders");
      const ordersData = await ordersResponse.json() as { orders: OrderRow[] };
      const runtimeData = await runtimeResponse.json() as RuntimeStatus;
      setOrders(ordersData.orders);
      setRuntime(runtimeData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load orders");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders(true);
    const id = window.setInterval(() => void loadOrders(false), 5000);
    return () => window.clearInterval(id);
  }, []);


  async function generateReport(orderId: string) {
    setError(null);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to generate report");
      await loadOrders(false);
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Unable to generate report");
    }
  }
  async function createDemoOrder() {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/orders/create-demo", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create demo order");
      await loadOrders(true);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create demo order");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Customer Fulfillment</Badge>{runtime ? (runtime.mode === "live_test" ? <Badge>Live test mode</Badge> : <Badge>Demo fallback enabled</Badge>) : <Badge>Checking runtime...</Badge>}</div>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">Orders become delivered research reports.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Orders are loaded from Prisma. When the database is empty, this panel waits for a Stripe test checkout or explicit demo order.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="outline" onClick={() => loadOrders(true)} disabled={loading}><RefreshCw className="size-4" /> Refresh</Button>
              {runtime?.demoMode ? <Button size="lg" onClick={createDemoOrder} disabled={creating}><Play className="size-4" />{creating ? "Fulfilling..." : "Create Demo Order"}</Button> : null}
            </div>
          </div>
          {error ? <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader><CardTitle>Customer Orders</CardTitle></CardHeader>
            <CardContent>
              {loading ? <EmptyState text="Loading orders from Prisma..." /> : orders.length === 0 ? <EmptyState text="No orders yet. Complete a Stripe test checkout or run explicit demo mode to create one." /> : (
                <div className="overflow-hidden rounded-lg border border-border/70">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-muted-foreground"><tr><th className="p-3 text-left">Order</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Product</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Report</th></tr></thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-border/70">
                          <td className="p-3 font-medium">{order.id}</td>
                          <td className="p-3"><p>{order.customerName ?? "Unknown customer"}</p><p className="text-xs text-muted-foreground">{order.customerEmail ?? "No email"}</p></td>
                          <td className="p-3"><p>{order.productName}</p><p className="text-xs text-muted-foreground">${(order.amountCents / 100).toFixed(2)}</p></td>
                          <td className="p-3"><Badge>{order.status}</Badge></td>
                          <td className="p-3">{order.reportUrl ? <Button asChild size="sm" variant="outline"><Link href={order.reportUrl}><FileText className="size-4" /> Open</Link></Button> : order.status === "paid" || order.status === "checkout_created" ? <Button size="sm" variant="outline" onClick={() => generateReport(order.id)}><FileText className="size-4" /> Generate</Button> : <span className="text-muted-foreground">Not generated</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PackageCheck className="size-4 text-primary" /> Agent Fulfillment Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-lg border border-border/70 bg-background/45 p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">{index + 1}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">{text}</div>;
}




