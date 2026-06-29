"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="max-w-lg border-destructive/30">
        <CardHeader>
          <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive"><AlertTriangle className="size-6" /></div>
          <CardTitle>Mission control hit an error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">{error.message || "The demo surface failed to render. You can reset this view and continue."}</p>
          <Button onClick={reset}>Reset view</Button>
        </CardContent>
      </Card>
    </main>
  );
}
