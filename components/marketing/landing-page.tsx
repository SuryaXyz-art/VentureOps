import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Sparkles, WalletCards, Workflow } from "lucide-react";
import { AgentCardGrid } from "@/components/agent/agent-card-grid";
import { OperatingLoopVisual } from "@/components/marketing/operating-loop-visual";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sponsorItems = [
  { icon: Workflow, label: "Hermes Agent workflow" },
  { icon: WalletCards, label: "Stripe revenue + agent payments" },
  { icon: ShieldCheck, label: "NVIDIA/NemoClaw-style safe runtime" }
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="grid-radar border-y border-border/60">
        <div className="container grid min-h-[720px] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge>Agentic Business Control Tower</Badge>
            <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-normal text-foreground sm:text-7xl">
              Launch. Earn. Spend. Fulfill. Audit. All by autonomous agents.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              VentureOps Autopilot turns one business goal and one budget into a Stripe-powered
              micro-business with policy-controlled agent operations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/demo">
                  <Play className="size-4" />
                  Run Demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/mission">
                  Open Mission Control
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <OperatingLoopVisual />
        </div>
      </section>

      <section className="container py-8">
        <div className="grid gap-3 lg:grid-cols-3">
          {sponsorItems.map((item) => (
            <Card key={item.label} className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <p className="font-medium">{item.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-14 pt-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <Badge>
              <Sparkles className="mr-1 size-3" />
              Mission specialists
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Eight agents, one governed operating loop.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Each agent has a narrow job, visible status, and an audit trail so autonomous operations
            feel powerful without becoming opaque.
          </p>
        </div>
        <AgentCardGrid />
      </section>
    </main>
  );
}

