"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ReceiptText, ShieldAlert } from "lucide-react";
import { AgentTimeline } from "@/components/agent/agent-timeline";
import { AuditLedger } from "@/components/audit/audit-ledger";
import { PLDashboard } from "@/components/dashboard/pl-dashboard";
import { SiteHeader } from "@/components/marketing/site-header";
import { StripeOfferCard } from "@/components/stripe/stripe-offer-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seededDemoRun } from "@/lib/demo/scenario";
import type { DemoRun } from "@/lib/agents/types";

const emptyRun: DemoRun = {
  ...seededDemoRun,
  events: [],
  receipts: [],
  report: "Click Run Judge Demo to execute the seeded business workflow.",
  nextActions: ["Waiting for autonomous agents."],
  revenue: 0,
  costs: 0,
  profit: 0,
  blockedRiskValue: 0
};

export function JudgeDemoPage() {
  const [run, setRun] = useState<DemoRun>(emptyRun);
  const [status, setStatus] = useState("idle");

  function executeDemo() {
    setStatus("planning");
    window.setTimeout(() => setStatus("executing"), 300);
    window.setTimeout(() => setStatus("fulfilled"), 700);
    window.setTimeout(() => {
      setRun(seededDemoRun);
      setStatus("audited");
    }, 1050);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid overflow-hidden border-primary/25 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid-radar p-6 sm:p-8">
            <Badge>One-click judge path</Badge>
            <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">Run the full agent business cycle.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              The seeded scenario launches a Web3 founder research-report service, earns simulated
              Stripe revenue, spends safely, blocks risky spend, fulfills the order, and produces a P&L audit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={executeDemo}>
                <Play className="size-4" />
                Run Judge Demo
              </Button>
              <Button size="lg" variant="outline">
                <ReceiptText className="size-4" />
                Status: {status}
              </Button>
            </div>
          </div>
          <div className="border-t border-border/70 p-6 lg:border-l lg:border-t-0">
            <div className="grid h-full content-center gap-3">
              {[
                ["Revenue", run.revenue],
                ["Approved cost", run.costs],
                ["Profit", run.profit],
                ["Blocked risk", run.blockedRiskValue]
              ].map(([label, value]) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg border border-border/70 bg-background/45 p-4"
                >
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-semibold">${Number(value).toFixed(2)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <PLDashboard
              revenue={run.revenue}
              costs={run.costs}
              profit={run.profit}
              blockedRiskValue={run.blockedRiskValue}
            />
            <AgentTimeline events={run.events} />
          </div>
          <div className="space-y-5">
            <StripeOfferCard checkoutUrl={run.checkoutUrl} />
            <AuditLedger receipts={run.receipts} />
            <Card>
              <CardHeader>
                <CardTitle>Fulfilled Research Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{run.report}</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Unsafe spend is shown as blocked before execution, not cleaned up after the fact.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
