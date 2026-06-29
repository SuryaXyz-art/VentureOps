"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ShieldAlert, Trophy } from "lucide-react";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { PLDashboard } from "@/components/dashboard/pl-dashboard";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runAgentWorkflow } from "@/lib/agents/orchestrator";
import type { AgentRole, BoardroomMessage } from "@/lib/agents/types";
import { demoGoal } from "@/lib/demo/scenario";
import { cn } from "@/lib/utils";

function MessageBubble({ message, index }: { message: BoardroomMessage; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "flex gap-3 rounded-lg border bg-background/48 p-4 backdrop-blur",
        message.emphasis === "veto" && "border-destructive/45 bg-destructive/10",
        message.emphasis === "win" && "border-primary/35 bg-primary/10",
        !message.emphasis && "border-border/70"
      )}
    >
      <AgentAvatar role={message.agent} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{message.agent} Agent</p>
          <Badge
            className={cn(
              message.emphasis === "veto" && "border-destructive/45 bg-destructive/10 text-destructive",
              message.emphasis === "win" && "border-primary/35 bg-primary/10 text-primary"
            )}
          >
            {message.decision}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.message}</p>
      </div>
    </motion.div>
  );
}

export function AgentBoardroom() {
  const workflow = useMemo(() => runAgentWorkflow(demoGoal, 25), []);
  const [visibleCount, setVisibleCount] = useState(1);
  const visibleMessages = workflow.boardroom.slice(0, visibleCount);
  const vetoes = workflow.spendDecisions.filter((decision) => decision.decision === "blocked");

  useEffect(() => {
    if (visibleCount >= workflow.boardroom.length) {
      return;
    }

    const timer = window.setTimeout(() => setVisibleCount((count) => count + 1), 720);
    return () => window.clearTimeout(timer);
  }, [visibleCount, workflow.boardroom.length]);

  function replay() {
    setVisibleCount(0);
    window.setTimeout(() => setVisibleCount(1), 80);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <Card className="grid-radar border-primary/25 p-6 sm:p-8">
              <Badge>Agent Boardroom Simulation</Badge>
              <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">Watch the agents debate the business run.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                The CEO proposes the micro-business, CFO sets the spend envelope, Risk vetoes unsafe purchases,
                and Audit records every decision as structured JSON.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={replay}>
                  <RotateCcw className="size-4" />
                  Replay Demo
                </Button>
                <Button size="lg" variant="outline">
                  <ShieldAlert className="size-4" />
                  {vetoes.length} CFO/Risk vetoes
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Boardroom Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {visibleMessages.map((message, index) => (
                  <MessageBubble key={message.id} message={message} index={index} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <PLDashboard
              revenue={workflow.pnl.revenue}
              costs={workflow.pnl.approvedCosts}
              profit={workflow.pnl.profit}
              blockedRiskValue={workflow.pnl.blockedSpend}
            />

            <Card>
              <CardHeader>
                <CardTitle>CFO / Risk Veto Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflow.spendDecisions.map((decision) => (
                  <div
                    key={decision.request.id}
                    className={cn(
                      "rounded-lg border p-3",
                      decision.decision === "blocked"
                        ? "border-destructive/40 bg-destructive/10"
                        : "border-primary/35 bg-primary/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{decision.request.vendor}</p>
                      <Badge
                        className={cn(
                          decision.decision === "blocked" && "border-destructive/45 bg-destructive/10 text-destructive"
                        )}
                      >
                        {decision.decision}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">${decision.request.amount.toFixed(2)}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{decision.reason}</p>
                    <p className="mt-2 text-xs text-primary">Policy: {decision.policyMatched}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Structured Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflow.events.map((event) => (
                  <div key={event.id} className="rounded-lg border border-border/70 bg-background/45 p-3">
                    <div className="flex items-center gap-3">
                      <AgentAvatar role={event.role as AgentRole} className="size-8" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">Learning recommendation</p>
                  <p className="text-sm leading-6 text-muted-foreground">{workflow.learning.nextExperiment}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

