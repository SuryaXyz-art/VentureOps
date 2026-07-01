import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoCheckoutPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle>Demo Checkout Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Stripe test keys were not required for this path. The system records a simulated $19
            customer order so users can verify the full earning, fulfillment, spend-control, and
            audit loop.
          </p>
          <Button asChild>
            <Link href="/">Return to control tower</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}



