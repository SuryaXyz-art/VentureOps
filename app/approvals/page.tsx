"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Approval = {
  id: string;
  businessRunId: string | null;
  spendRequestRef: string;
  vendor: string;
  amountCents: number;
  category: string;
  reason: string;
  riskLevel: string;
  matchedRules: string[];
  remainingCents: number;
  receiptRequired: boolean;
  riskScore: number;
  createdAt: string;
};

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadApprovals(showLoading = false) {
    if (showLoading) setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/approvals", { cache: "no-store" });
      const data = await response.json() as { approvals?: Approval[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to load approvals");
      setApprovals(data.approvals ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load approvals");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    void loadApprovals(true);
    // Approval decisions are operator-controlled, so this page refreshes on demand
    // instead of polling and filling the terminal with GET /api/approvals logs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resolve(id: string, action: "approve" | "reject") {
    setActingId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/approvals/${id}/${action}`, { method: "POST" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? `Unable to ${action} approval`);
      setMessage(action === "approve" ? "Spend approved and P&L updated." : "Spend rejected, blocked risk updated, and audit receipt created.");
      await loadApprovals(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Unable to ${action} approval`);
    } finally {
      setActingId(null);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Founder Approval Queue</Badge><Badge>Policy-gated spend</Badge></div>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">Approve only the spend that earns its keep.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Medium-risk or threshold-crossing requests wait here until a founder approves or rejects them. Every action writes receipts, agent events, and P&L updates.</p>
            </div>
            <Button size="lg" variant="outline" onClick={() => loadApprovals(true)} disabled={loading}><RefreshCw className="size-4" /> Refresh from DB</Button>
          </div>
          {message ? <div className="mt-4 rounded-lg border border-border/70 bg-background/45 p-3 text-sm text-muted-foreground">{message}</div> : null}
        </Card>

        <div className="mt-5 grid gap-4">
          {loading ? <EmptyState text="Loading approval queue from Prisma..." /> : approvals.length === 0 ? <EmptyState text="No pending approvals. Start a business run to create threshold-gated spend requests." /> : approvals.map((approval) => (
            <Card key={approval.id} className="overflow-hidden border-accent/30">
              <CardContent className="p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><ShieldAlert className="size-5 text-accent" /><h2 className="text-xl font-semibold">{approval.vendor}</h2><Badge>needs founder approval</Badge><Badge>{approval.riskLevel} risk</Badge></div>
                    <p className="mt-2 text-sm text-muted-foreground">{approval.category} | {dollars(approval.amountCents)} | requested {new Date(approval.createdAt).toLocaleString()}</p><p className="mt-2 text-xs text-muted-foreground">Run {approval.businessRunId ?? "unassigned"} | Spend request {approval.spendRequestRef} | Receipt {approval.receiptRequired ? "required" : "optional"}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{approval.reason}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:w-72">
                    <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Risk score</p><p className="text-2xl font-semibold">{approval.riskScore}/100</p></div>
                    <div className="rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs text-muted-foreground">Remaining if queued</p><p className="text-2xl font-semibold">{dollars(approval.remainingCents)}</p></div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-border/70 bg-background/45 p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Policy match</p><div className="mt-2 flex flex-wrap gap-2">{approval.matchedRules.map((rule) => <span key={rule} className="rounded-md border border-border/70 bg-background/45 px-2 py-1 text-xs text-muted-foreground">{rule}</span>)}</div></div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => resolve(approval.id, "approve")} disabled={actingId === approval.id}><CheckCircle2 className="size-4" /> Approve spend</Button>
                  <Button variant="outline" className="border-destructive/45 bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={() => resolve(approval.id, "reject")} disabled={actingId === approval.id}><XCircle className="size-4" /> Reject and block</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">{text}</div>;
}



