"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ExternalLink, Radio, ReceiptText, RefreshCw, WalletCards } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderRow = {
  id: string;
  stripeCheckoutId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  productName: string;
  amountCents: number;
  status: string;
  mode?: string;
};

type EventRow = {
  id: string;
  role: string;
  title: string;
  detail: string;
  status: string;
  createdAt: string;
};

type PnlPayload = { revenue: number; hasData: boolean };
type RuntimeStatus = { demoMode: boolean; mode: "demo" | "live_test"; stripeConfigured: boolean };

export function StripeRevenuePage() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [message, setMessage] = useState("Ready to create checkout session");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [pnl, setPnl] = useState<PnlPayload>({ revenue: 0, hasData: false });
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setDataLoading(true);
    setError(null);
    try {
      const [ordersResponse, eventsResponse, pnlResponse, runtimeResponse] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/pnl", { cache: "no-store" }),
        fetch("/api/status/runtime", { cache: "no-store" })
      ]);
      if (!ordersResponse.ok || !eventsResponse.ok || !pnlResponse.ok) throw new Error("Unable to load Stripe revenue data");
      setOrders(((await ordersResponse.json()) as { orders: OrderRow[] }).orders);
      setEvents(((await eventsResponse.json()) as { events: EventRow[] }).events.filter((event) => event.role === "Stripe"));
      setPnl(((await pnlResponse.json()) as { pnl: PnlPayload }).pnl);
      setRuntime(await runtimeResponse.json() as RuntimeStatus);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Stripe revenue data");
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const id = window.setInterval(() => void loadData(), 3000);
    return () => window.clearInterval(id);
  }, []);

  async function startCheckout() {
    setLoading(true);
    setMessage("Creating checkout...");
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerEmail: "founder@example.com",
          customerName: "Demo Web3 Founder",
          productName: "AI Web3 Founder Research Report",
          amountCents: 1900
        })
      });
      const data = (await response.json()) as { checkoutUrl?: string; mode?: string; error?: string };
      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Checkout failed");
      }
      setMessage(data.mode === "stripe" ? "Redirecting to Stripe Checkout" : "Demo checkout completed");
      window.location.href = data.checkoutUrl;
    } catch (checkoutError) {
      setMessage(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Stripe Test Mode Revenue</Badge>{runtime ? (runtime.mode === "live_test" ? <Badge>Live test mode</Badge> : <Badge>Demo fallback enabled</Badge>) : <Badge>Checking runtime...</Badge>}{runtime && !runtime.stripeConfigured ? <Badge>Stripe not configured</Badge> : null}</div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">Turn the agent offer into test-mode revenue.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Checkout and order records are backed by Prisma. Demo checkout is only allowed when DEMO_MODE=true.
              </p>
            </div>
            <Card className="border-primary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary"><WalletCards className="size-6" /></div>
                <div><p className="text-sm text-muted-foreground">Revenue metric</p><p className="text-3xl font-semibold">${pnl.revenue.toFixed(2)}</p></div>
              </div>
            </Card>
          </div>
          {error ? <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <CardHeader><CardTitle>Product Card</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-background/45 p-4">
                  <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">AI Web3 Founder Research Report</p><p className="mt-1 text-sm text-muted-foreground">Market signals, competitor notes, and launch recommendations.</p></div><Badge>Test mode</Badge></div>
                  <p className="mt-5 text-4xl font-semibold">$19</p>
                </div>
                <Button className="w-full" size="lg" onClick={startCheckout} disabled={loading}>
                  <CreditCard className="size-4" />{loading ? "Creating checkout..." : "Checkout with Stripe"}<ExternalLink className="size-4" />
                </Button>
                <Button className="w-full" size="sm" variant="outline" onClick={loadData} disabled={dataLoading}><RefreshCw className="size-4" /> Refresh live records</Button>
                <p className="text-sm text-muted-foreground">{message}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Stripe Event Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dataLoading ? <EmptyState text="Loading Stripe events from Prisma..." /> : events.length > 0 ? events.map((event, index) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex gap-3 rounded-lg border border-border/70 bg-background/45 p-3">
                    <div className="mt-1 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Radio className="size-4" /></div>
                    <div><p className="text-sm font-medium">{event.title}</p><p className="text-sm leading-6 text-muted-foreground">{event.detail}</p></div>
                  </motion.div>
                )) : <EmptyState text="No Stripe agent events have been persisted yet." />}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Customer / Order Table</CardTitle></CardHeader>
              <CardContent>
                {dataLoading ? <EmptyState text="Loading orders from Prisma..." /> : orders.length === 0 ? <EmptyState text="No customer orders yet. Create a real Stripe test checkout or explicit demo checkout." /> : (
                  <div className="overflow-hidden rounded-lg border border-border/70"><table className="w-full text-sm"><thead className="bg-secondary/60 text-muted-foreground"><tr><th className="p-3 text-left">Order</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Amount</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{orders.map((order) => (<tr key={order.id} className="border-t border-border/70"><td className="p-3 font-medium">{order.id}</td><td className="p-3"><p>{order.customerName ?? "Unknown customer"}</p><p className="text-xs text-muted-foreground">{order.customerEmail ?? "No email"}</p></td><td className="p-3">${(order.amountCents / 100).toFixed(2)}</td><td className="p-3"><Badge>{order.status}</Badge></td></tr>))}</tbody></table></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="size-4 text-primary" /> Revenue Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>With Stripe keys, checkout redirects to Stripe test mode and webhook/order events are persisted.</p>
                <p>With DEMO_MODE=false, missing Stripe keys produce a visible configuration error instead of fake revenue.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/45 p-6 text-center text-muted-foreground">{text}</div>;
}






