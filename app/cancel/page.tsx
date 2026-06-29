import Link from "next/link";
import { XCircle } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CancelPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="grid min-h-[70vh] place-items-center p-6">
        <Card className="max-w-xl border-destructive/30">
          <CardHeader>
            <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive"><XCircle className="size-6" /></div>
            <CardTitle>Checkout canceled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>The test checkout was canceled. No order was recorded as paid.</p>
            <Button asChild><Link href="/stripe-revenue">Return to Stripe Revenue</Link></Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
