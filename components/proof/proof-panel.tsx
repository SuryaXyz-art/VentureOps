import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProofPanelProps = {
  businessRunId: string | null;
  stripeCheckoutSessionId: string | null;
  stripeEventId: string | null;
  hermesProvider: string;
  hermesModel: string;
  receiptsCount: number;
  blockedSpendAmount: number;
  netProfit: number;
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function ProofPanel(props: ProofPanelProps) {
  const rows = [
    ["BusinessRun ID", props.businessRunId ?? "No run yet"],
    ["Stripe checkout session", props.stripeCheckoutSessionId ?? "No checkout yet"],
    ["Stripe event ID", props.stripeEventId ?? "No webhook yet"],
    ["Hermes provider/model", `${props.hermesProvider} / ${props.hermesModel}`],
    ["Receipts count", String(props.receiptsCount)],
    ["Blocked spend", money(props.blockedSpendAmount)],
    ["Net profit", money(props.netProfit)]
  ];

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Proof Panel</CardTitle>
          <Badge>DB-backed</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border/70 bg-background/45 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
