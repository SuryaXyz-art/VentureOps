import Link from "next/link";
import { Activity, BadgeCheck, Boxes, CreditCard, FileJson, Workflow } from "lucide-react";
import { ExportJsonButton } from "@/components/audit/export-json-button";
import { SiteHeader } from "@/components/marketing/site-header";
import { ProofPanel } from "@/components/proof/proof-panel";
import { RunLiveTestDemoButton } from "@/components/proof/run-live-test-demo-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProofSnapshot } from "@/lib/data/proof";

export const dynamic = "force-dynamic";

function StatusPill({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warn" }) {
  const toneClass = tone === "good" ? "border-primary/40 bg-primary/10 text-primary" : tone === "warn" ? "border-amber-300/40 bg-amber-400/10 text-amber-100" : "";
  return <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">{label}</p><Badge className={toneClass}>{value}</Badge></div>;
}

export default async function SubmissionLivePage() {
  const snapshot = await getProofSnapshot();
  const auditExport = JSON.stringify({ runId: snapshot.proof.businessRunId, runtime: snapshot.runtime, stripe: snapshot.stripe, hermes: snapshot.hermes, receipts: snapshot.receipts, pnl: snapshot.pnl }, null, 2);

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Live Submission Proof</Badge><Badge>Stripe test mode</Badge><Badge>Hermes/Nemotron ready</Badge></div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">VentureOps Autopilot proves agents can run a business safely.</h1>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">A judge can see the live runtime, start a real Stripe test-mode checkout, inspect Hermes/Nemotron status, verify receipts, and confirm P&L from Prisma records in one screen.</p>
            </div>
            <RunLiveTestDemoButton />
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ProofPanel businessRunId={snapshot.proof.businessRunId} stripeCheckoutSessionId={snapshot.proof.stripeCheckoutSessionId} stripeEventId={snapshot.proof.stripeEventId} hermesProvider={snapshot.hermes.provider} hermesModel={snapshot.hermes.model} receiptsCount={snapshot.proof.receiptsCount} blockedSpendAmount={snapshot.proof.blockedSpendAmount} netProfit={snapshot.proof.netProfit} />

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="size-4 text-primary" /> Runtime Status</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <StatusPill label="Runtime mode" value={snapshot.runtime.mode} tone={snapshot.runtime.demoMode ? "warn" : "good"} />
              <StatusPill label="Stripe configured" value={String(snapshot.runtime.stripeConfigured)} tone={snapshot.runtime.stripeConfigured ? "good" : "warn"} />
              <StatusPill label="Hermes provider" value={snapshot.hermes.provider} tone={snapshot.hermes.provider === "hermes" ? "good" : "warn"} />
              <StatusPill label="Hermes connected" value={String(snapshot.hermes.connected)} tone={snapshot.hermes.connected ? "good" : "warn"} />
              <StatusPill label="Latest run" value={snapshot.proof.businessRunId ?? "none"} />
              <StatusPill label="Latest webhook" value={snapshot.stripe.latestWebhookEventId ?? "none"} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <InfoCard icon={Workflow} title="1. Start Run">CEO and Growth use Hermes/Nemotron when configured, while CFO policy and risk remain deterministic.</InfoCard>
          <InfoCard icon={CreditCard} title="2. Earn Revenue">Stripe test mode creates a reusable product/price, Checkout Session, CustomerOrder, and webhook reconciliation.</InfoCard>
          <InfoCard icon={FileJson} title="3. Prove Control">Receipts, policy decisions, blocked spend, and P&L are exported from Prisma-backed audit records.</InfoCard>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="size-4 text-primary" /> Architecture Diagram</CardTitle></CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg border border-border/70 bg-background/70 p-4 text-xs leading-6 text-muted-foreground">{`Founder Goal + Budget
        |
        v
CEO/Growth/Ops/Learning -> Hermes local API -> Nemotron 3 Ultra
        |
        v
CFO Policy + Spend Agent + Risk Engine -> deterministic budget firewall
        |
        +--> Stripe Checkout test mode -> webhook -> Prisma orders/revenue
        |
        +--> Approval Queue -> receipts/events/P&L
        |
        v
Audit + Profit/Loss + Submission Proof Panel`}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Judge Actions</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild><Link href="/judge-demo">Open Judge Demo</Link></Button>
              <Button asChild variant="outline"><Link href="/approvals">Open Approval Queue</Link></Button>
              <Button asChild variant="outline"><Link href="/audit">Open Audit Receipts</Link></Button>
              <ExportJsonButton json={auditExport} filename="ventureops-live-audit-proof.json" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof Workflow; title: string; children: React.ReactNode }) {
  return <Card><CardContent className="p-5"><div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="size-4" /></div><h2 className="font-semibold">{title}</h2></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{children}</p></CardContent></Card>;
}
