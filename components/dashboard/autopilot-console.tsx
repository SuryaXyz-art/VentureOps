"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Play, ShieldCheck, WalletCards } from "lucide-react";
import { AgentTimeline } from "@/components/agent/agent-timeline";
import { AuditLedger } from "@/components/audit/audit-ledger";
import { PLDashboard } from "@/components/dashboard/pl-dashboard";
import { StripeOfferCard } from "@/components/stripe/stripe-offer-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoRun } from "@/lib/agents/types";

const defaultGoal =
  "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.";

const initialRun: DemoRun = {
  goal: defaultGoal,
  budget: 25,
  revenue: 19,
  costs: 6,
  profit: 13,
  blockedRiskValue: 60,
  checkoutUrl: "/demo-checkout/web3-research-report",
  events: [],
  spendRequests: [],
  receipts: [],
  report: "Run the demo to generate the first fulfilled research report.",
  nextActions: ["Run the one-click demo to activate agents."]
};

export function AutopilotConsole() {
  const [goal, setGoal] = useState(defaultGoal);
  const [run, setRun] = useState<DemoRun>(initialRun);
  const [isPending, startTransition] = useTransition();

  function executeDemo() {
    startTransition(async () => {
      const response = await fetch("/api/demo/run", { method: "POST" });
      const data = (await response.json()) as DemoRun;
      setRun(data);
    });
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="grid-radar border-b border-border/70">
        <div className="container flex min-h-[620px] flex-col justify-between py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <WalletCards className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hermes Agent Accelerated Business Hackathon</p>
                <h1 className="text-xl font-semibold">VentureOps Autopilot</h1>
              </div>
            </div>
            <Badge className="hidden sm:inline-flex">Deterministic demo mode ready</Badge>
          </nav>

          <div className="grid items-end gap-8 py-14 lg:grid-cols-[1.08fr_0.92fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <Badge>Agentic Business Control Tower</Badge>
              <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
                Launch, monetize, fulfill, govern, and audit an AI-run micro-business.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Founder goal in. Autonomous agents out: plan, budget, Stripe offer, order fulfillment,
                spend controls, receipts, and P&L.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={executeDemo} disabled={isPending}>
                  <Play className="size-4" />
                  {isPending ? "Running agents..." : "Run Demo"}
                </Button>
                <Button size="lg" variant="outline">
                  <ShieldCheck className="size-4" />
                  Policy guardrails active
                </Button>
              </div>
            </motion.div>

            <Card className="border-primary/25 bg-card/85">
              <CardHeader>
                <CardTitle>Founder Command</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className="min-h-36 w-full resize-none rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 outline-none ring-primary/40 focus:ring-2"
                />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/70 bg-background/45 p-3">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="mt-1 text-xl font-semibold">${run.budget}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/45 p-3">
                    <p className="text-xs text-muted-foreground">Offer</p>
                    <p className="mt-1 text-xl font-semibold">$19</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/45 p-3">
                    <p className="text-xs text-muted-foreground">Mode</p>
                    <p className="mt-1 text-xl font-semibold">Safe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container grid gap-5 py-8 lg:grid-cols-[1.2fr_0.8fr]">
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
              <div className="mt-4 space-y-2">
                {run.nextActions.map((action) => (
                  <div key={action} className="rounded-lg border border-border/70 bg-background/45 p-3 text-sm">
                    {action}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}



