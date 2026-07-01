"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileJson, Filter, ReceiptText, ShieldCheck } from "lucide-react";
import { ExportJsonButton } from "@/components/audit/export-json-button";
import { ReceiptCard, type AuditReceiptView } from "@/components/audit/receipt-card";
import { SiteHeader } from "@/components/marketing/site-header";
import { OperationTimeline, type OperationStep } from "@/components/operations/operation-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const all = "all";

type RuntimeStatus = { mode: "demo" | "live_test" };
type EventRow = { id: string; role: OperationStep["agent"]; title: string; detail: string; status: string; createdAt: string };

export default function AuditPage() {
  const [agent, setAgent] = useState(all);
  const [decision, setDecision] = useState(all);
  const [status, setStatus] = useState(all);
  const [receipts, setReceipts] = useState<AuditReceiptView[]>([]);
  const [steps, setSteps] = useState<OperationStep[]>([]);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [receiptsResponse, eventsResponse, runtimeResponse] = await Promise.all([
          fetch("/api/receipts", { cache: "no-store" }),
          fetch("/api/events", { cache: "no-store" }),
          fetch("/api/status/runtime", { cache: "no-store" })
        ]);
        if (!receiptsResponse.ok || !eventsResponse.ok) throw new Error("Unable to load audit records");
        const receiptsData = await receiptsResponse.json() as { receipts: AuditReceiptView[] };
        const eventsData = await eventsResponse.json() as { events: EventRow[] };
        setReceipts(receiptsData.receipts);
        setSteps(eventsData.events.map((event) => ({ id: event.id, label: event.title, agent: event.role, status: event.status, detail: event.detail, timestamp: event.createdAt })).reverse());
        setRuntime(await runtimeResponse.json() as RuntimeStatus);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load audit records");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const agents = [all, ...Array.from(new Set(receipts.map((receipt) => receipt.agent)))];
  const decisions = [all, ...Array.from(new Set(receipts.map((receipt) => receipt.decision)))];
  const statuses = [all, ...Array.from(new Set(receipts.map((receipt) => receipt.status)))];
  const filtered = useMemo(() => receipts.filter((receipt) =>
    (agent === all || receipt.agent === agent) &&
    (decision === all || receipt.decision === decision) &&
    (status === all || receipt.status === status)
  ), [agent, decision, receipts, status]);

  const blockedCount = receipts.filter((receipt) => receipt.decision === "blocked").length;
  const approvedCount = receipts.filter((receipt) => receipt.decision === "approved").length;
  const exportJson = JSON.stringify({ exportedAt: new Date().toISOString(), runtime, filters: { agent, decision, status }, receiptCount: receipts.length, eventCount: steps.length, receipts, operations: steps }, null, 2);

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Business Black Box</Badge>{runtime ? (runtime.mode === "live_test" ? <Badge>Live test mode</Badge> : <Badge>Demo fallback enabled</Badge>) : <Badge>Checking runtime...</Badge>}</div>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold sm:text-6xl">Audit log for every agent action.</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Receipts and agent events are loaded from Prisma. Empty databases show no fake audit packet.</p>
            </div>
            <ExportJsonButton json={exportJson} />
          </div>
          {error ? <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary"><ReceiptText className="size-4" /><span className="text-sm font-medium">Receipts</span></div>
              <p className="mt-3 text-3xl font-semibold">{receipts.length}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/45 p-4">
              <div className="flex items-center gap-2 text-muted-foreground"><BarChart3 className="size-4" /><span className="text-sm font-medium">Approved / blocked</span></div>
              <p className="mt-3 text-3xl font-semibold">{approvedCount} / {blockedCount}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/45 p-4">
              <div className="flex items-center gap-2 text-muted-foreground"><FileJson className="size-4" /><span className="text-sm font-medium">Export payload</span></div>
              <p className="mt-3 text-3xl font-semibold">{steps.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">agent events</p>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="size-4 text-primary" /> Filters</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[["Agent", agent, setAgent, agents], ["Decision", decision, setDecision, decisions], ["Status", status, setStatus, statuses]].map(([label, value, setter, options]) => (
                  <label key={String(label)} className="block"><span className="text-sm text-muted-foreground">{String(label)}</span><select value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background/70 px-3 py-2 outline-none ring-primary/40 focus:ring-2">{(options as string[]).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Agent Action Timeline</CardTitle></CardHeader>
              <CardContent>{loading ? <EmptyState text="Loading agent events from Prisma..." /> : <OperationTimeline steps={steps} />}</CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            {loading ? <EmptyState text="Loading receipts from Prisma..." /> : filtered.length === 0 ? <EmptyState text="No receipts match this view yet." /> : filtered.map((receipt) => <ReceiptCard key={receipt.id} receipt={receipt} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">{text}</div>;
}



