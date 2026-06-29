"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clipboard, ExternalLink, FileJson, PartyPopper, Play, RotateCcw } from "lucide-react";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { ExportJsonButton } from "@/components/audit/export-json-button";
import { SiteHeader } from "@/components/marketing/site-header";
import { AnimatedMetric } from "@/components/profit-loss/animated-metric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentRole } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

type DemoStep = {
  label: string;
  agent: AgentRole;
  detail: string;
  status: "queued" | "running" | "approved" | "blocked" | "fulfilled" | "audited" | "complete";
};

type JudgeRunResponse = { generatedReport?: { provider?: string; warning?: string }; run?: { id?: string } };
type LlmStatus = { label?: string; provider?: string; model?: string; connected?: boolean; lastError?: string | null; lastResponseId?: string | null; lastContentPreview?: string | null };
type RuntimeStatus = { demoMode: boolean; mode: "demo" | "live_test" };
type PnlSnapshot = { revenue: number; approvedCosts: number; netProfit: number; blockedRiskySpend: number; summary: string; hasData: boolean };

type ReceiptPayload = { receipts: unknown[] };

const emptyPnl: PnlSnapshot = {
  revenue: 0,
  approvedCosts: 0,
  netProfit: 0,
  blockedRiskySpend: 0,
  summary: "No live business records yet. Run a real test checkout or open /judge-demo?mode=demo for explicit demo fallback.",
  hasData: false
};

const demoPnl: PnlSnapshot = {
  revenue: 19,
  approvedCosts: 6,
  netProfit: 13,
  blockedRiskySpend: 60,
  summary: "Explicit demo mode: the agent launched a paid business, earned $19, spent $6 safely, blocked $60 risk, and generated $13 profit.",
  hasData: true
};

const demoSteps: DemoStep[] = [
  { label: "Founder goal entered", agent: "CEO", detail: "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.", status: "complete" },
  { label: "CEO Agent plans business", agent: "CEO", detail: "Uses Hermes/Nemotron for creative planning when connected, then emits structured plan JSON.", status: "complete" },
  { label: "CFO Agent creates $25 budget firewall", agent: "CFO", detail: "Deterministically sets max single spend, approval threshold, receipt rules, and blocked categories.", status: "approved" },
  { label: "Growth Agent creates paid offer", agent: "Growth", detail: "Uses Hermes/Nemotron for offer copy, landing promise, and launch tweet when connected.", status: "complete" },
  { label: "Stripe Agent creates $19 test product/checkout", agent: "Stripe", detail: "Prepares AI Web3 Founder Research Report checkout in demo or Stripe test mode.", status: "approved" },
  { label: "Customer buys report", agent: "Stripe", detail: "The order is recorded as paid in the business run.", status: "complete" },
  { label: "Ops Agent generates report", agent: "Ops", detail: "Uses Hermes/Nemotron for report content when connected, then marks deterministic delivery state.", status: "fulfilled" },
  { label: "Spend Agent requests $6 data API", agent: "Spend", detail: "Requests Web3Data API for compliant public market data.", status: "running" },
  { label: "Risk Agent approves $6 spend", agent: "Risk", detail: "Allowed vendor, low risk, under threshold, receipt required. No LLM approval is accepted.", status: "approved" },
  { label: "Spend Agent requests $60 infra upgrade", agent: "Spend", detail: "Requests Production Infra Upgrade before revenue is validated.", status: "running" },
  { label: "Risk Agent blocks it", agent: "Risk", detail: "Blocked category, exceeds max single spend, exceeds budget envelope. Deterministic veto.", status: "blocked" },
  { label: "Audit Agent creates receipts", agent: "Audit", detail: "Records decisions, matched policies, proof references, and mode labels.", status: "audited" },
  { label: "P&L shows final outcome", agent: "Audit", detail: "Live mode reads P&L from Prisma; explicit demo mode shows the seeded judge outcome.", status: "complete" },
  { label: "Learning Agent recommends next experiment", agent: "Learning", detail: "Uses Hermes/Nemotron for suggestions when connected, without overriding spend controls.", status: "complete" }
];

const demoScript = `Run the 90-second demo. The founder asks VentureOps Autopilot to launch a paid AI research-report service for Web3 founders with a $25 budget. CEO plans the business, CFO creates the budget firewall, Growth writes the offer, Stripe prepares a $19 checkout, the customer buys, Ops generates the report, Risk approves $6 of safe data spend, blocks a $60 infrastructure upgrade, Audit records receipts, and P&L shows the database-backed business outcome.`;

const statusClass: Record<DemoStep["status"], string> = {
  queued: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  running: "border-sky-400/40 bg-sky-400/10 text-sky-100",
  approved: "border-primary/40 bg-primary/10 text-primary",
  blocked: "border-destructive/45 bg-destructive/10 text-destructive",
  fulfilled: "border-accent/45 bg-accent/10 text-accent",
  audited: "border-violet-300/40 bg-violet-400/10 text-violet-100",
  complete: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
};

export function JudgeDemoPage() {
  const searchParams = useSearchParams();
  const explicitDemo = searchParams.get("mode") === "demo";
  const [visibleCount, setVisibleCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [providerLabel, setProviderLabel] = useState("LLM: Mock");
  const [llmStatus, setLlmStatus] = useState<LlmStatus | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [pnl, setPnl] = useState<PnlSnapshot>(explicitDemo ? demoPnl : emptyPnl);
  const [auditJson, setAuditJson] = useState("{}");
  const [runStatus, setRunStatus] = useState("Ready to run the local Hermes-safe business workflow.");
  const [runWarning, setRunWarning] = useState<string | null>(null);
  const complete = visibleCount >= demoSteps.length;
  const visibleSteps = useMemo(() => demoSteps.slice(0, visibleCount), [visibleCount]);

  async function loadLiveData() {
    if (explicitDemo) {
      setPnl(demoPnl);
      setAuditJson(JSON.stringify({ mode: "explicit_demo", pnl: demoPnl }, null, 2));
      return;
    }
    const [pnlResponse, receiptsResponse, runtimeResponse] = await Promise.all([
      fetch("/api/pnl", { cache: "no-store" }),
      fetch("/api/receipts", { cache: "no-store" }),
      fetch("/api/status/runtime", { cache: "no-store" })
    ]);
    if (pnlResponse.ok) setPnl(((await pnlResponse.json()) as { pnl: PnlSnapshot }).pnl);
    if (receiptsResponse.ok) setAuditJson(JSON.stringify(await receiptsResponse.json() as ReceiptPayload, null, 2));
    if (runtimeResponse.ok) setRuntime(await runtimeResponse.json() as RuntimeStatus);
  }

  useEffect(() => {
    fetch("/api/llm/status").then((response) => response.json()).then((data: LlmStatus) => { setLlmStatus(data); setProviderLabel(data.label ?? "LLM: Mock"); }).catch(() => setProviderLabel("LLM: Mock"));
    void loadLiveData().catch(() => setRunWarning("Unable to load live dashboard data."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explicitDemo]);

  async function runDemo() {
    setVisibleCount(0);
    setCopied(false);
    setRunning(true);
    setRunWarning(null);
    setRunStatus(explicitDemo ? "Running explicit demo fallback workflow..." : "Calling server-side CEO, Growth, Ops, and Learning agents...");

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 120000);
      const response = explicitDemo
        ? await fetch("/api/demo/run", { method: "POST", signal: controller.signal })
        : await fetch("/api/runs/start", {
            method: "POST",
            signal: controller.signal,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              goal: "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.",
              budgetCents: 2500,
              customerEmail: "founder@example.com",
              mode: "stripe_test"
            })
          });
      window.clearTimeout(timeout);
      const data = (await response.json()) as JudgeRunResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? `Workflow returned ${response.status}`);
      if (data.run?.id) setRunId(data.run.id);
      if (data.generatedReport?.warning) setRunWarning(data.generatedReport.warning);
      setRunStatus(data.run?.id ? `Business run ${data.run.id} started. Playing judge timeline.` : "Demo workflow complete. Playing judge timeline.");
      await loadLiveData();
      playTimeline();
    } catch (error) {
      const message = error instanceof DOMException && error.name === "AbortError" ? "Workflow timed out. Check Hermes, Stripe, and webhook services." : error instanceof Error ? error.message : "Workflow unavailable.";
      setRunWarning(message);
      setRunStatus(message.includes("Hermes") ? "Hermes not connected. Fix LLM configuration or use /judge-demo?mode=demo." : "Business run failed. Check configuration and try again.");
      setRunning(false);
    }
  }

  function playTimeline() {
    demoSteps.forEach((_, index) => {
      window.setTimeout(() => {
        setVisibleCount(index + 1);
        if (index === demoSteps.length - 1) {
          setRunning(false);
          setRunStatus("Demo complete. Spend control stayed deterministic; metrics are loaded from the configured data source.");
          void loadLiveData().catch(() => undefined);
        }
      }, 250 + index * 500);
    });
  }

  function resetDemo() {
    setRunning(false);
    setVisibleCount(0);
    setCopied(false);
    setRunWarning(null);
    setRunStatus("Ready to run the local Hermes-safe business workflow.");
  }

  async function copyScript() {
    await navigator.clipboard.writeText(demoScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar relative overflow-hidden border-primary/25 p-6 sm:p-8">
          {complete ? <CompletionBurst /> : null}
          <div className="flex flex-wrap gap-2"><Badge>Final Judge Mode</Badge><Badge>{providerLabel}</Badge>{explicitDemo ? <Badge>Explicit demo fallback</Badge> : runtime ? (runtime.mode === "live_test" ? <Badge>Live test mode</Badge> : <Badge>Demo fallback enabled</Badge>) : <Badge>Checking runtime...</Badge>}</div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div><h1 className="text-4xl font-semibold sm:text-6xl">Run the full business in 90 seconds.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{pnl.summary}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Creative planning is powered by Hermes/Nemotron when connected. Spend control remains deterministic. Hermes never approves spend, changes policy, or receives secrets.</p></div>
            <div className="grid gap-3 sm:grid-cols-2"><Button size="lg" onClick={runDemo} disabled={running}><Play className="size-4" /> {running ? "Demo running..." : "Run 90-second Judge Demo"}</Button><Button size="lg" variant="outline" onClick={resetDemo}><RotateCcw className="size-4" /> Reset demo</Button><Button size="lg" variant="outline" onClick={copyScript}><Clipboard className="size-4" /> {copied ? "Copied" : "Copy demo script"}</Button><ExportJsonButton json={auditJson} filename="ventureops-judge-audit.json" /></div>
          </div>
          <div className="mt-5 rounded-lg border border-border/70 bg-background/45 p-4 text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">Runtime:</span> {runStatus}{runId ? <div className="mt-2">Run ID: <span className="font-mono text-foreground">{runId}</span></div> : null}<div className="mt-2 grid gap-2 md:grid-cols-2"><div>Provider: <span className="text-foreground">{llmStatus?.provider ?? "mock"}</span></div><div>Model: <span className="text-foreground">{llmStatus?.model ?? "mock"}</span></div><div>Connected: <span className="text-foreground">{String(llmStatus?.connected ?? false)}</span></div><div>Response ID: <span className="font-mono text-foreground">{llmStatus?.lastResponseId ?? "none"}</span></div></div>{llmStatus?.lastContentPreview ? <div className="mt-2 line-clamp-2">Preview: {llmStatus.lastContentPreview}</div> : null}{llmStatus?.lastError ? <div className="mt-2 text-amber-200">Hermes last error: {llmStatus.lastError}</div> : null}{runWarning ? <div className="mt-2 text-amber-200">Fallback warning: {runWarning}</div> : null}</div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <Card><CardHeader><CardTitle>Animated Business Run</CardTitle></CardHeader><CardContent className="space-y-3">{visibleSteps.length === 0 ? <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">Press Run 90-second Judge Demo to start the autonomous operating loop.</div> : visibleSteps.map((step, index) => (<motion.div key={`${step.label}-${index}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3 rounded-lg border bg-background/45 p-4", step.status === "blocked" ? "border-destructive/40" : "border-border/70")}><AgentAvatar role={step.agent} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{step.label}</p><Badge className={statusClass[step.status]}>{step.status}</Badge></div><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p></div></motion.div>))}</CardContent></Card>

          <div className="space-y-5"><Card><CardHeader><CardTitle>Final P&L</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3">{[["Revenue", pnl.revenue], ["Costs", pnl.approvedCosts], ["Profit", pnl.netProfit], ["Blocked Risk", pnl.blockedRiskySpend]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">$<AnimatedMetric value={Number(value)} /></p></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Open Panels</CardTitle></CardHeader><CardContent className="grid gap-3"><Button asChild variant="outline"><Link href="/stripe-revenue">Open Stripe revenue panel <ExternalLink className="size-4" /></Link></Button><Button asChild variant="outline"><Link href="/profit-loss">Open P&L report <ExternalLink className="size-4" /></Link></Button><Button asChild variant="outline"><Link href="/audit">Open audit log <FileJson className="size-4" /></Link></Button></CardContent></Card>{complete ? <Card className="border-primary/35 bg-primary/10"><CardContent className="flex items-center gap-3 p-4"><CheckCircle2 className="size-6 text-primary" /><div><p className="font-semibold">Demo complete</p><p className="text-sm text-muted-foreground">Receipts, report, blocked spend, and P&L are ready for judging.</p></div></CardContent></Card> : null}</div>
        </div>
      </section>
    </main>
  );
}

function CompletionBurst() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{Array.from({ length: 18 }).map((_, index) => <motion.div key={index} initial={{ opacity: 0, y: 20, x: "50%" }} animate={{ opacity: [0, 1, 0], y: [-10, -120 - (index % 5) * 14], x: `${10 + index * 5}%`, rotate: 180 }} transition={{ duration: 1.4, delay: index * 0.025 }} className="absolute bottom-8 left-1/2 size-2 rounded-sm bg-primary" />)}<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: [0, 1, 0], scale: [0.8, 1.05, 1] }} transition={{ duration: 1.6 }} className="absolute right-8 top-8 flex items-center gap-2 rounded-lg border border-primary/30 bg-background/80 px-4 py-3 text-primary shadow-glow"><PartyPopper className="size-4" /> Business run complete</motion.div></div>;
}





