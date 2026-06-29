import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditReceipt } from "@/lib/agents/types";

export function AuditLedger({ receipts }: { receipts: AuditReceipt[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Ledger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {receipts.map((receipt) => (
          <div key={receipt.id} className="rounded-lg border border-border/70 bg-background/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{receipt.source}</p>
              <Badge>{receipt.decision}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">${receipt.amount.toFixed(2)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{receipt.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
