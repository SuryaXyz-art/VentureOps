"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, KeyRound, Network, ReceiptText, RefreshCw, ShieldCheck, SlidersHorizontal, WalletCards } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultBudgetPolicy } from "@/lib/policy/default-policy";
import type { BudgetPolicyConfig, PolicyDecision } from "@/lib/policy/types";
import { cn } from "@/lib/utils";

const decisionStyles: Record<PolicyDecision, string> = {
  approved: "border-primary/40 bg-primary/10 text-primary",
  needs_approval: "border-accent/45 bg-accent/10 text-accent",
  blocked: "border-destructive/45 bg-destructive/10 text-destructive"
};

const safeRuntimeBoundaries = [
  { title: "Credential boundary", icon: KeyRound, detail: "Secrets stay in environment variables, API keys are redacted, and card details never enter logs." },
  { title: "Network boundary", icon: Network, detail: "Allowed domains are documented for localhost, Stripe, Nous, and NVIDIA test/demo integrations." },
  { title: "Spend boundary", icon: WalletCards, detail: "Every agent spend request is checked against budget, vendor, category, threshold, and risk." },
  { title: "Audit boundary", icon: ReceiptText, detail: "Approvals and blocks produce receipts with matched policy, reason, mode, and proof reference." }
];

type SpendRequestRow = { id: string; vendor: string; amountCents: number; category: string; reason: string; riskLevel: string; status: string; createdAt: string };
type PolicyDecisionRow = { id: string; spendRequestRef: string; decision: PolicyDecision; reason: string; matchedRulesJson: string; remainingCents: number; riskScore: number };
type RunPayload = { id: string; mode?: string; status: string; budgetCents: number; costCents: number; blockedRiskCents: number; spendRequests: SpendRequestRow[]; policyDecisions: PolicyDecisionRow[] };

function currency(value: number) {
  return `$${value.toFixed(2)}`;
}

function cents(value: number) {
  return value / 100;
}

function parseRules(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function BudgetFirewall() {
  const [policy, setPolicy] = useState<BudgetPolicyConfig>(defaultBudgetPolicy);
  const [run, setRun] = useState<RunPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const policyTouchedRef = useRef(false);
  const syncedRunIdRef = useRef<string | null>(null);

  async function loadRun(showLoading = false) {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/runs/latest", { cache: "no-store" });
      const data = await response.json() as { run?: RunPayload | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to load latest run");
      setRun(data.run ?? null);
      if (data.run && !policyTouchedRef.current && syncedRunIdRef.current !== data.run.id) {
        setPolicy((current) => ({ ...current, totalBudget: cents(data.run!.budgetCents), spentSoFar: cents(data.run!.costCents), mode: data.run!.mode === "stripe_test" ? "live_test" : current.mode }));
        syncedRunIdRef.current = data.run.id;
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load latest run");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    void loadRun(true);
    const id = window.setInterval(() => void loadRun(false), 5000);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decisionBySpend = useMemo(() => new Map((run?.policyDecisions ?? []).map((decision) => [decision.spendRequestRef, decision])), [run]);
  const approvedTotal = cents(run?.costCents ?? 0);
  const blockedRiskTotal = cents(run?.blockedRiskCents ?? 0);
  const remainingBudget = Math.max(0, policy.totalBudget - approvedTotal);
  const meterPct = policy.totalBudget > 0 ? Math.max(0, Math.min(100, (remainingBudget / policy.totalBudget) * 100)) : 0;
  const policyJson = JSON.stringify(policy, null, 2);

  function updatePolicy<K extends keyof BudgetPolicyConfig>(key: K, value: BudgetPolicyConfig[K]) {
    policyTouchedRef.current = true;
    setPolicy((current) => ({ ...current, [key]: value }));
  }

  function exportPolicy() {
    const blob = new Blob([policyJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ventureops-budget-policy.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Budget Firewall</Badge>{run ? <Badge>Run {run.id}</Badge> : null}</div>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">Policy-controlled agent spending.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Live spend requests, decisions, and budget totals are loaded from Prisma. Approval queue actions update this view and the P&L.</p>
            </div>
            <div className="flex flex-wrap gap-3"><Button size="lg" variant="outline" onClick={() => loadRun(true)} disabled={loading}><RefreshCw className="size-4" /> Refresh from DB</Button><Button size="lg" onClick={exportPolicy}><Download className="size-4" /> Export policy</Button></div>
          </div>
          {error ? <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-primary" /> Policy Builder</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block"><span className="text-sm text-muted-foreground">Total budget</span><input type="number" value={policy.totalBudget} onChange={(event) => updatePolicy("totalBudget", Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2 outline-none ring-primary/40 focus:ring-2" /></label>
                  <label className="block"><span className="text-sm text-muted-foreground">Spent so far</span><input type="number" value={policy.spentSoFar} onChange={(event) => updatePolicy("spentSoFar", Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2 outline-none ring-primary/40 focus:ring-2" /></label>
                  <label className="block"><span className="text-sm text-muted-foreground">Max single spend</span><input type="number" value={policy.maxSingleSpend} onChange={(event) => updatePolicy("maxSingleSpend", Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2 outline-none ring-primary/40 focus:ring-2" /></label>
                  <label className="block"><span className="text-sm text-muted-foreground">Approval threshold</span><input type="number" value={policy.approvalThreshold} onChange={(event) => updatePolicy("approvalThreshold", Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2 outline-none ring-primary/40 focus:ring-2" /></label>
                </div>
                <label className="block"><span className="text-sm text-muted-foreground">Mode</span><div className="mt-2 grid grid-cols-2 gap-2">{["shadow", "live_test"].map((mode) => <button key={mode} type="button" onClick={() => updatePolicy("mode", mode as BudgetPolicyConfig["mode"])} className={cn("rounded-lg border px-3 py-3 text-sm font-medium transition", policy.mode === mode ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/55 text-muted-foreground hover:bg-secondary/70")}>{mode}</button>)}</div></label>
                <div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/45 p-3 text-sm"><input type="checkbox" checked={policy.requiresReason} onChange={(event) => updatePolicy("requiresReason", event.target.checked)} /> Requires reason</label><label className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/45 p-3 text-sm"><input type="checkbox" checked={policy.requiresReceipt} onChange={(event) => updatePolicy("requiresReceipt", event.target.checked)} /> Requires receipt</label></div>
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle>Policy JSON</CardTitle></CardHeader><CardContent><pre className="max-h-[460px] overflow-auto rounded-lg border border-border bg-background/75 p-4 text-xs leading-5 text-muted-foreground">{policyJson}</pre></CardContent></Card>
          </div>

          <div className="space-y-5">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Budget Firewall Status</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Remaining</p><p className="mt-1 text-2xl font-semibold">{currency(remainingBudget)}</p></div><div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Autonomous approved</p><p className="mt-1 text-2xl font-semibold">{currency(approvedTotal)}</p></div><div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3"><p className="text-xs text-muted-foreground">Blocked risk total</p><p className="mt-1 text-2xl font-semibold text-destructive">{currency(blockedRiskTotal)}</p></div></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Budget remaining meter</span><span>{Math.round(meterPct)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${meterPct}%` }} /></div></div></CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> NVIDIA Safe Runtime Map</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{safeRuntimeBoundaries.map((boundary) => <div key={boundary.title} className="rounded-lg border border-border/70 bg-background/45 p-3"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><boundary.icon className="size-4" /></div><p className="font-semibold">{boundary.title}</p></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{boundary.detail}</p></div>)}</CardContent></Card>

            <div className="grid gap-4">
              {loading ? <EmptyState text="Loading live spend requests from Prisma..." /> : !run || run.spendRequests.length === 0 ? <EmptyState text="No spend requests yet. Start a business run to populate the firewall." /> : run.spendRequests.map((request) => {
                const decision = decisionBySpend.get(request.id);
                const finalDecision = (decision?.decision ?? request.status) as PolicyDecision;
                const rules = decision ? parseRules(decision.matchedRulesJson) : [];
                return <Card key={request.id} className="overflow-hidden"><CardContent className="p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{request.vendor}</h3><Badge className={decisionStyles[finalDecision] ?? decisionStyles.blocked}>{finalDecision}</Badge>{finalDecision === "needs_approval" ? <Button asChild size="sm" variant="outline"><Link href={"/approvals" as Route}>Open approval queue</Link></Button> : null}</div><p className="mt-1 text-sm text-muted-foreground">{currency(cents(request.amountCents))} | {request.category} | {request.riskLevel} risk | Spend Agent</p></div><div className="rounded-lg border border-border/70 bg-background/45 px-3 py-2 text-right"><p className="text-xs text-muted-foreground">Risk score</p><p className="font-semibold">{decision?.riskScore ?? 0}/100</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{request.reason}</p><div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Why this decision?</p><p className="mt-1 text-sm leading-6 text-foreground/90">{decision?.reason ?? "Awaiting policy evaluation."}</p></div><div className="mt-3 flex flex-wrap gap-2">{rules.map((rule) => <span key={rule} className="rounded-md border border-border/70 bg-background/45 px-2 py-1 text-xs text-muted-foreground">{rule}</span>)}</div></CardContent></Card>;
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">{text}</div>;
}







