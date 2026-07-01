import Link from "next/link";
import { Activity, BadgeDollarSign, CheckCircle2, ClipboardList, LockKeyhole, Play, ShieldCheck, WalletCards } from "lucide-react";
import { getLatestRun } from "@/lib/data/dashboard";
import { getRuntimeConfig } from "@/lib/config/runtime";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function dollars(cents?: number | null) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function parsePayload(event: { payloadJson: string | null }) {
  if (!event.payloadJson) return null;
  try {
    return JSON.parse(event.payloadJson) as { payload?: Record<string, unknown>; reason?: string; decision?: string };
  } catch {
    return null;
  }
}

export default async function AgentsPage() {
  const [run, runtime] = await Promise.all([getLatestRun(), Promise.resolve(getRuntimeConfig())]);
  const ceo = run?.agentEvents.find((event) => event.role === "CEO");
  const cfo = run?.agentEvents.find((event) => event.role === "CFO");
  const stripe = run?.agentEvents.find((event) => event.role === "Stripe");
  const audit = run?.agentEvents.find((event) => event.role === "Audit");
  const plan = ceo ? parsePayload(ceo)?.payload : null;
  const policy = cfo ? parsePayload(cfo)?.payload : null;
  const latestOrder = run?.customerOrders[0];
  const latestReport = run?.fulfillmentReports[0];
  const approvedSpend = run?.spendRequests.filter((spend) => spend.status === "approved").reduce((sum, spend) => sum + spend.amountCents, 0) ?? 0;
  const blockedSpend = run?.spendRequests.filter((spend) => spend.status === "blocked").reduce((sum, spend) => sum + spend.amountCents, 0) ?? 0;

  const agentCards = [
    { name: "CEO Agent", type: "Business planner", status: ceo?.status ?? "waiting", detail: ceo?.detail ?? "Waiting for a founder goal.", icon: ClipboardList },
    { name: "CFO Agent", type: "Budget firewall", status: cfo?.status ?? "waiting", detail: cfo?.detail ?? "No policy created yet.", icon: ShieldCheck },
    { name: "Stripe Agent", type: "Revenue operator", status: latestOrder?.status ?? stripe?.status ?? "waiting", detail: latestOrder?.stripeCheckoutId ? `Checkout ${latestOrder.stripeCheckoutId}` : "No checkout session yet.", icon: WalletCards },
    { name: "Audit Agent", type: "Business black box", status: audit?.status ?? "waiting", detail: `${run?.receipts.length ?? 0} receipts and ${run?.policyDecisions.length ?? 0} policy decisions recorded.`, icon: Activity }
  ];

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-12 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge>Agent Management</Badge>
            <Badge>{runtime.safeStatus.mode === "live_test" ? "Live test mode" : "Explicit demo mode"}</Badge>
            <Badge>{runtime.llmProvider === "hermes" ? "LLM: Local Hermes + Nemotron" : "LLM: Mock"}</Badge>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">Operate the autonomous business agent.</h1>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">
                This page turns the latest BusinessRun into an operator console: goal, budget, runtime mode, success condition, Stripe status, spend controls, proof state, and next actions are all sourced from Prisma.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild><Link href="/mission"><Play className="size-4" /> Start from Mission Control</Link></Button>
              <Button asChild variant="outline"><Link href="/operations">View logs</Link></Button>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <Card className="p-4"><p className="text-sm text-muted-foreground">Business goal</p><p className="mt-2 text-lg font-semibold">{run?.goal ?? "No live run yet"}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Operating budget</p><p className="mt-2 text-3xl font-semibold">{dollars(run?.budgetCents)}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Approved / blocked spend</p><p className="mt-2 text-3xl font-semibold">{dollars(approvedSpend)} / {dollars(blockedSpend)}</p></Card>
          <Card className="p-4"><p className="text-sm text-muted-foreground">Stripe payment status</p><p className="mt-2 text-3xl font-semibold capitalize">{latestOrder?.status?.replaceAll("_", " ") ?? "No order"}</p></Card>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader><CardTitle>Agent Roster</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {agentCards.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div key={agent.name} className="rounded-lg border border-border/70 bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="size-5" /></div><div><p className="font-semibold">{agent.name}</p><p className="text-xs text-muted-foreground">{agent.type}</p></div></div>
                      <Badge>{agent.status}</Badge>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{agent.detail}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Success And Proof</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-background/45 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-primary" /> Success condition</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{typeof plan?.successMetric === "string" ? plan.successMetric : "Run a paid checkout, record spend decisions, generate fulfillment proof, and show positive controllable margin."}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/45 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><LockKeyhole className="size-4 text-primary" /> Tool permissions</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Allowed vendors: {Array.isArray(policy?.allowedVendors) ? policy.allowedVendors.join(", ") : "Web3Data API, LeadList Lite"}. Max single spend: {typeof policy?.maxSingleSpend === "number" ? `$${policy.maxSingleSpend}` : "$10"}. Receipts required for approved spend.</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/45 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><BadgeDollarSign className="size-4 text-primary" /> Outcome proof</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{latestReport ? `Report generated: ${latestReport.title}.` : "No report has been generated for the latest run yet."} {latestOrder?.stripeCheckoutId ? `Checkout session: ${latestOrder.stripeCheckoutId}.` : "No checkout proof yet."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
