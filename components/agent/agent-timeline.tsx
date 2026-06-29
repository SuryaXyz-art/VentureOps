"use client";

import { motion } from "framer-motion";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentEvent, AgentEventStatus } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

const statusClass: Record<AgentEventStatus, string> = {
  idle: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  planning: "border-primary/40 bg-primary/10 text-primary",
  executing: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  blocked: "border-destructive/40 bg-destructive/10 text-destructive",
  fulfilled: "border-accent/40 bg-accent/10 text-accent",
  audited: "border-violet-300/40 bg-violet-400/10 text-violet-100",
  queued: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  running: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  complete: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  failed: "border-destructive/45 bg-destructive/10 text-destructive"
};

export function AgentTimeline({ events }: { events: AgentEvent[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Agent Execution Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-3 rounded-lg border border-border/70 bg-background/42 p-3"
          >
            <div className="absolute left-8 top-14 h-full w-px bg-gradient-to-b from-primary/40 to-transparent last:hidden" />
            <AgentAvatar role={event.role} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{event.role} Agent</p>
                <Badge className={cn(statusClass[event.status])}>{event.status}</Badge>
                {typeof event.amount === "number" ? (
                  <span className="text-xs text-muted-foreground">${event.amount.toFixed(2)}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium text-foreground/90">{event.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.detail}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

