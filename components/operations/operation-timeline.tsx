import { AgentAvatar } from "@/components/agent/agent-avatar";
import { Badge } from "@/components/ui/badge";
import type { AgentRole } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

export interface OperationStep {
  id: string;
  label: string;
  agent: AgentRole;
  status: string;
  detail: string;
  timestamp: string;
}

export function OperationTimeline({ steps }: { steps: OperationStep[] }) {
  return (
    <div className="space-y-3">
      {steps.length === 0 ? <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">No operations recorded yet.</div> : steps.map((step, index) => (
        <div key={step.id} className={cn("relative flex gap-3 rounded-lg border border-border/70 bg-background/45 p-4", step.status === "blocked" && "border-destructive/35 bg-destructive/10")}>
          <div className="absolute left-9 top-14 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-primary/35 to-transparent" />
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">{index + 1}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <AgentAvatar role={step.agent} className="size-8" />
              <p className="font-semibold">{step.label}</p>
              <Badge>{step.status}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(step.timestamp).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
