import Link from "next/link";
import { ExternalLink, Rocket } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demoScript = "Run /judge-demo. The founder enters a Web3 research-report goal with a $25 budget. Agents plan the business, create a $19 Stripe test/demo checkout, fulfill the order with a generated report, approve $6 safe data spend, block $60 risky infrastructure spend, create receipts, and show $13 profit.";

export default function SubmissionPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <Badge>Submission Asset</Badge>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">VentureOps Autopilot</h1>
          <p className="mt-5 max-w-4xl text-xl leading-8 text-muted-foreground">An Agentic Business Control Tower that lets AI agents launch, earn, spend, fulfill, and audit a micro-business under a budget firewall.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/judge-demo"><Rocket className="size-4" /> Run Judge Demo</Link></Button><Button asChild size="lg" variant="outline"><Link href="/audit">Open Audit <ExternalLink className="size-4" /></Link></Button></div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <InfoCard title="One-line pitch">Agents that safely earn, spend, fulfill, and audit a real micro-business workflow.</InfoCard>
          <InfoCard title="100-word description">VentureOps Autopilot turns one founder goal and one budget into a governed AI-operated business run. CEO, CFO, Growth, Stripe, Ops, Spend, Risk, Audit, and Learning agents coordinate to plan a paid offer, prepare Stripe test-mode checkout, fulfill a customer report, evaluate spend, block unsafe purchases, record receipts, and produce a replayable P&L audit. The demo is deterministic by default for judging, works without external keys, and clearly labels simulated versus Stripe test-mode behavior. It showcases agent commerce, policy-gated spending, safe runtime boundaries, and business black-box observability in a premium enterprise control tower.</InfoCard>
          <InfoCard title="Tech stack">Next.js, TypeScript, Tailwind, shadcn-style primitives, Framer Motion, Prisma, SQLite, Stripe test mode, deterministic mock LLM adapters, optional Nous/NVIDIA adapter stubs.</InfoCard>
          <InfoCard title="Sponsor alignment">Hermes-compatible skill pack, Stripe Checkout test-mode earning flow, NVIDIA/NemoClaw-style safe runtime manifest, budget firewall, network allowlist, audit receipts, and deterministic local judging mode.</InfoCard>
          <InfoCard title="Demo script">{demoScript}</InfoCard>
          <Card>
            <CardHeader><CardTitle>Links</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Placeholder label="GitHub" value="https://github.com/your-org/ventureops-autopilot" />
              <Placeholder label="Live demo" value="https://your-demo-url.example" />
              <Placeholder label="Tweet" value="https://x.com/your-post" />
              <Placeholder label="Video" value="https://youtube.com/your-demo-video" />
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

function Placeholder({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-all font-medium">{value}</p></div>;
}
