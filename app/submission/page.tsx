import Link from "next/link";
import { ExternalLink, Rocket, ShieldCheck, Workflow } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demoScript = "Open /judge-demo or /submission-live. Enter the Web3 research-report goal with a $25 budget, start the business run, complete Stripe test checkout when configured, then verify the paid order, generated report, policy decisions, receipts, and P&L from Prisma-backed dashboards.";

const submissionLinks = [
  { label: "GitHub", value: process.env.NEXT_PUBLIC_GITHUB_URL },
  { label: "Live demo", value: process.env.NEXT_PUBLIC_LIVE_DEMO_URL },
  { label: "Product post", value: process.env.NEXT_PUBLIC_PRODUCT_POST_URL },
  { label: "Video walkthrough", value: process.env.NEXT_PUBLIC_VIDEO_URL }
];

export default function SubmissionPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Product Brief</Badge><Badge>Agent operations control tower</Badge></div>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">VentureOps Autopilot</h1>
          <p className="mt-5 max-w-4xl text-xl leading-8 text-muted-foreground">A premium control tower where founders give agents a business goal and budget, then watch revenue, fulfillment, spend controls, receipts, and P&L move through one governed operating system.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/judge-demo"><Rocket className="size-4" /> Open Demo</Link></Button><Button asChild size="lg" variant="outline"><Link href="/submission-live"><Workflow className="size-4" /> Live Proof</Link></Button><Button asChild size="lg" variant="outline"><Link href="/audit">Open Audit <ExternalLink className="size-4" /></Link></Button></div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <InfoCard title="One-line pitch">Autonomous agents that launch a paid micro-business, control spend with deterministic policy, fulfill customer work, and prove the outcome with receipts.</InfoCard>
          <InfoCard title="Product description">VentureOps Autopilot turns one founder goal and one operating budget into a managed business run. CEO, Growth, Ops, and Learning agents can use Hermes/Nemotron for creative planning when connected. CFO, Spend, Risk, Audit, and policy decisions stay deterministic so money movement is governed. Stripe test mode creates real checkout sessions when configured, Prisma stores every run, order, receipt, spend request, policy decision, report, Stripe event, and P&L record, and the dashboards show what happened without hiding behind fake live data.</InfoCard>
          <InfoCard title="Tech stack">Next.js App Router, TypeScript, Tailwind, shadcn-style UI primitives, Framer Motion, Prisma, SQLite, Stripe test mode, Hermes OpenAI-compatible local API, deterministic mock fallback, and safety manifests for controlled runtime alignment.</InfoCard>
          <InfoCard title="Operator value">Founders can start with a goal, see the offer, checkout, fulfillment, approval queue, audit trail, and profit/loss in one place. The system is designed to make agent actions visible, reversible where needed, and policy-gated before spend impacts the business.</InfoCard>
          <InfoCard title="Demo script">{demoScript}</InfoCard>
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Links</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {submissionLinks.map((link) => <Placeholder key={link.label} label={link.label} value={link.value} />)}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{children}</p></CardContent></Card>;
}

function Placeholder({ label, value }: { label: string; value?: string }) {
  const displayValue = value?.trim();
  const hasValue = Boolean(displayValue);
  return <div className={hasValue ? "rounded-lg border border-border/70 bg-background/45 p-3" : "rounded-lg border border-amber-300/40 bg-amber-400/10 p-3"}><p className="text-xs text-muted-foreground">{label}</p><p className={hasValue ? "mt-1 break-all font-medium" : "mt-1 font-medium text-amber-100"}>{displayValue || "Add before submission"}</p></div>;
}
