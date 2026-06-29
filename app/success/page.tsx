import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppUrl } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  stripeCheckoutId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  productName: string;
  amountCents: number;
  status: string;
};

async function loadOrder(sessionId?: string) {
  if (!sessionId) return null;
  try {
    const response = await fetch(`${getAppUrl()}/api/orders?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json() as { orders: OrderRow[] };
    return data.orders[0] ?? null;
  } catch {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: { searchParams: { demo?: string; session_id?: string; orderId?: string } }) {
  const isDemo = searchParams.demo === "true";
  const order = await loadOrder(searchParams.session_id);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="grid min-h-[70vh] place-items-center p-6">
        <Card className="max-w-xl border-primary/30">
          <CardHeader>
            <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary"><CheckCircle2 className="size-6" /></div>
            <div className="flex flex-wrap gap-2"><Badge>{isDemo ? "Demo checkout" : "Stripe test checkout"}</Badge>{order ? <Badge>{order.status}</Badge> : <Badge>Waiting for webhook</Badge>}</div>
            <CardTitle className="mt-3">Order received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>{isDemo ? "Demo Checkout Completed. No Stripe keys were required." : "Stripe Checkout returned successfully. Webhook reconciliation updates the order from checkout_created to paid."}</p>
            {searchParams.session_id ? <p>Session: <span className="font-mono text-foreground">{searchParams.session_id}</span></p> : null}
            {order ? <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-foreground">Order: {order.id}</p><p>{order.productName} · ${(order.amountCents / 100).toFixed(2)}</p><p>{order.customerName ?? "Unknown customer"} · {order.customerEmail ?? "No email"}</p></div> : searchParams.orderId ? <p>Order: <span className="font-mono text-foreground">{searchParams.orderId}</span></p> : <p>The order record is not visible yet. If this was a real Stripe test checkout, make sure `stripe listen --forward-to localhost:3000/api/stripe/webhook` is running.</p>}
            <div className="flex flex-wrap gap-3"><Button asChild><Link href="/orders">Open Orders</Link></Button><Button asChild variant="outline"><Link href="/stripe-revenue">Back to Stripe Revenue</Link></Button></div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
