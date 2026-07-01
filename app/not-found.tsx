import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary"><SearchX className="size-6" /></div>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">This route is not part of the VentureOps product flow.</p>
          <Button asChild><Link href="/judge-demo">Open Demo</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}

