"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Play, Radar, ShieldCheck } from "lucide-react";
import { AgentTimeline } from "@/components/agent/agent-timeline";
import { PLDashboard } from "@/components/dashboard/pl-dashboard";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoGoal, seededDemoRun } from "@/lib/demo/scenario";
import type { AgentEvent, DemoRun } from "@/lib/agents/types";

type ExecutionMode = "shadow" | "stripe_test";
type StartRunResponse = { run?: { id: string; goal: string; budgetCents: number; revenueCents: number; costCents: number; profitCents: number; blockedRiskCents: number; agentEvents?: AgentEvent[] }; checkout?: { checkoutUrl?: string }; error?: string };

export function MissionControl() {
  const [goal, setGoal] = useState(demoGoal);
  const [budgetInput, setBudgetInput] = useState("25");
  const [businessType, setBusinessType] = useState("AI research service");
  const [mode, setMode] = useState<ExecutionMode>("stripe_test");
  const [status, setStatus] = useState("idle");
  const [run, setRun] = useState<DemoRun>({ ...seededDemoRun, revenue: 0, costs: 0, profit: 0, blockedRiskValue: 0, events: [] });
  const [message, setMessage] = useState("Ready to run a governed business workflow.");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const budget = Number.parseFloat(budgetInput || "0");
  const safeBudget = Number.isFinite(budget) && budget > 0 ? budget : 25;

  async function runAutopilot() {
    setRunning(true);
    setCheckoutUrl(null);
    setStatus("planning");
    setMessage(mode === "shadow" ? "Running local shadow preview..." : "Starting DB-backed Stripe test business run...");

    if (mode === "shadow") {
      window.setTimeout(() => setStatus("executing"), 350);
      window.setTimeout(() => {
        setRun({ ...seededDemoRun, goal, budget: safeBudget });
        setStatus("audited");
        setMessage("Shadow preview completed. No Stripe checkout or live spend was created.");
        setRunning(false);
      }, 900);
      return;
    }

    try {
      const response = await fetch("/api/runs/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ goal, budgetCents: Math.round(safeBudget * 100), customerEmail: "founder@example.com", mode: "stripe_test" })
      });
      const data = await response.json() as StartRunResponse;
      if (!response.ok || !data.run) throw new Error(data.error ?? "Unable to start autopilot run");
      const savedRun = data.run;
      setRun({ ...seededDemoRun, goal: savedRun.goal, budget: savedRun.budgetCents / 100, revenue: savedRun.revenueCents / 100, costs: savedRun.costCents / 100, profit: savedRun.profitCents / 100, blockedRiskValue: savedRun.blockedRiskCents / 100, events: savedRun.agentEvents ?? [] });
      setCheckoutUrl(data.checkout?.checkoutUrl ?? null);
      setStatus("awaiting payment");
      setMessage("Autopilot created a persistent run. Open Operations, Revenue, Orders, Audit, or P&L to inspect live records.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to start autopilot run");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container grid gap-5 pb-10 pt-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="h-fit border-primary/25 glass-surface">
          <CardHeader>
            <Badge><Radar className="mr-1 size-3" /> Mission Control</Badge>
            <CardTitle className="mt-4 text-2xl">Configure autonomous operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block"><span className="text-sm font-medium text-muted-foreground">Business goal</span><textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-2 min-h-36 w-full resize-none rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 outline-none ring-primary/40 focus:ring-2" /></label>
            <label className="block"><span className="text-sm font-medium text-muted-foreground">Operating budget</span><div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-background/70 px-4 py-3"><span className="text-muted-foreground">$</span><input inputMode="decimal" value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} className="w-full bg-transparent outline-none" /></div></label>
            <label className="block"><span className="text-sm font-medium text-muted-foreground">Business type</span><select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-sm outline-none ring-primary/40 focus:ring-2"><option>AI research service</option><option>Founder intelligence brief</option><option>B2B lead magnet studio</option><option>Micro SaaS validation sprint</option></select></label>
            <label className="block"><span className="text-sm font-medium text-muted-foreground">Execution mode</span><div className="mt-2 grid grid-cols-2 gap-2">{[{ label: "Shadow Mode", value: "shadow" }, { label: "Stripe Test Mode", value: "stripe_test" }].map((item) => <button key={item.value} type="button" onClick={() => setMode(item.value as ExecutionMode)} className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${mode === item.value ? "border-primary bg-primary/12 text-primary shadow-glow" : "border-border bg-background/55 text-muted-foreground hover:bg-secondary/70"}`}>{item.label}</button>)}</div></label>
            <Button size="lg" className="w-full" onClick={runAutopilot} disabled={running || goal.trim().length < 10}><Play className="size-4" />{running ? "Running Autopilot..." : "Run Autopilot"}</Button>
            {checkoutUrl ? <Button asChild size="sm" variant="outline" className="w-full"><a href={checkoutUrl}>Open Stripe Checkout <ExternalLink className="size-4" /></a></Button> : null}
            <p className="text-sm leading-6 text-muted-foreground">{message}</p>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 glass-surface"><div className="grid gap-3 md:grid-cols-4">{[["Status", status], ["Budget", `$${safeBudget.toFixed(2)}`], ["Type", businessType], ["Mode", mode === "stripe_test" ? "Stripe Test Mode" : "Shadow Mode"]].map(([label, value]) => <div key={label} className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-semibold">{value}</p></div>)}</div></Card>
          </motion.div>
          <PLDashboard revenue={run.revenue} costs={run.costs} profit={run.profit} blockedRiskValue={run.blockedRiskValue} />
          <AgentTimeline events={run.events} />
          <Card className="p-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><ShieldCheck className="size-5" /></div><div><p className="font-semibold">Policy gate armed</p><p className="text-sm text-muted-foreground">Autonomous spend remains bounded by budget, purpose, and risk.</p></div></div></Card>
        </div>
      </section>
    </main>
  );
}


