import { AgentAvatar } from "@/components/agent/agent-avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AgentRole } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

export interface AuditReceiptView {
  id: string;
  timestamp: string;
  agent: AgentRole;
  action: string;
  amount: number;
  vendor: string;
  decision: "approved" | "blocked" | "recorded" | "fulfilled" | "recommended" | "needs_approval";
  status: string;
  reason: string;
  matchedPolicy: string;
  proof: string;
  mode: "shadow" | "test" | "live";
}

const decisionClass: Record<AuditReceiptView["decision"], string> = {
  approved: "border-primary/40 bg-primary/10 text-primary",
  blocked: "border-destructive/45 bg-destructive/10 text-destructive",
  recorded: "border-sky-300/40 bg-sky-400/10 text-sky-100",
  fulfilled: "border-accent/45 bg-accent/10 text-accent",
  recommended: "border-violet-300/40 bg-violet-400/10 text-violet-100",
  needs_approval: "border-amber-300/40 bg-amber-400/10 text-amber-100"
};

export function ReceiptCard({ receipt }: { receipt: AuditReceiptView }) {
  return (
    <Card className={cn("p-4", receipt.decision === "blocked" && "border-destructive/35")}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <AgentAvatar role={receipt.agent} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{receipt.action}</p>
              <Badge className={decisionClass[receipt.decision]}>{receipt.decision}</Badge>
              <Badge>{receipt.mode}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{receipt.id} | {new Date(receipt.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/45 px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-semibold">${receipt.amount.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Agent / Vendor</p><p className="mt-1 text-sm font-medium">{receipt.agent} Agent | {receipt.vendor}</p></div>
        <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Matched policy</p><p className="mt-1 text-sm font-medium">{receipt.matchedPolicy}</p></div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{receipt.reason}</p>
      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">Proof: {receipt.proof}</div>
    </Card>
  );
}
