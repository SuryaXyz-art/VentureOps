"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Radar, ShieldCheck } from "lucide-react";
import { AgentTimeline } from "@/components/agent/agent-timeline";
import { PLDashboard } from "@/components/dashboard/pl-dashboard";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoGoal, seededDemoRun } from "@/lib/demo/scenario";
import type { DemoRun } from "@/lib/agents/types";

export function MissionControl() {
  const [goal, setGoal] = useState(demoGoal);
  const [budget, setBudget] = useState(25);
  const [businessType, setBusinessType] = useState("AI research service");
  const [mode, setMode] = useState("Shadow Mode");
  const [status, setStatus] = useState("idle");
  const [run, setRun] = useState<DemoRun>({ ...seededDemoRun, events: [] });

  function runAutopilot() {
    setStatus("planning");
    window.setTimeout(() => setStatus("executing"), 450);
    window.setTimeout(() => {
      setRun({ ...seededDemoRun, goal, budget });
      setStatus("audited");
    }, 950);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container grid gap-5 pb-10 pt-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="h-fit border-primary/25">
          <CardHeader>
            <Badge>
              <Radar className="mr-1 size-3" />
              Mission Control
            </Badge>
            <CardTitle className="mt-4 text-2xl">Configure autonomous operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Business goal</span>
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="mt-2 min-h-36 w-full resize-none rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 outline-none ring-primary/40 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Operating budget</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-background/70 px-4 py-3">
                <span className="text-muted-foreground">$</span>
                <input
                  type="number"
                  min={1}
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Business type</span>
              <select
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-sm outline-none ring-primary/40 focus:ring-2"
              >
                <option>AI research service</option>
                <option>Founder intelligence brief</option>
                <option>B2B lead magnet studio</option>
                <option>Micro SaaS validation sprint</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Execution mode</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["Shadow Mode", "Stripe Test Mode"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                      mode === item
                        ? "border-primary bg-primary/12 text-primary"
                        : "border-border bg-background/55 text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </label>
            <Button size="lg" className="w-full" onClick={runAutopilot}>
              <Play className="size-4" />
              Run Autopilot
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ["Status", status],
                  ["Budget", `$${budget}`],
                  ["Type", businessType],
                  ["Mode", mode]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border/70 bg-background/45 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 truncate font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
          <PLDashboard
            revenue={run.revenue}
            costs={run.costs}
            profit={run.profit}
            blockedRiskValue={run.blockedRiskValue}
          />
          <AgentTimeline events={run.events} />
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="font-semibold">Policy gate armed</p>
                <p className="text-sm text-muted-foreground">Autonomous spend remains bounded by budget, purpose, and risk.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
