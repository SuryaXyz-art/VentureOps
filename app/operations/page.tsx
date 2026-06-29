"use client";

import { useEffect, useState } from "react";
import { OperationTimeline, type OperationStep } from "@/components/operations/operation-timeline";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type RuntimeStatus = { mode: "demo" | "live_test" };
type EventRow = { id: string; role: OperationStep["agent"]; title: string; detail: string; status: string; createdAt: string };

export default function OperationsPage() {
  const [steps, setSteps] = useState<OperationStep[]>([]);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
      setLoading(true);
      try {
        const [eventsResponse, runtimeResponse] = await Promise.all([
          fetch("/api/events", { cache: "no-store" }),
          fetch("/api/status/runtime", { cache: "no-store" })
        ]);
        if (!eventsResponse.ok) throw new Error("Unable to load operations timeline");
        const events = ((await eventsResponse.json()) as { events: EventRow[] }).events;
        setSteps(events.map((event) => ({ id: event.id, label: event.title, agent: event.role, status: event.status, detail: event.detail, timestamp: event.createdAt })).reverse());
        setRuntime(await runtimeResponse.json() as RuntimeStatus);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load operations timeline");
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="container pb-10 pt-4">
        <Card className="grid-radar border-primary/25 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2"><Badge>Operations Timeline</Badge>{runtime ? (runtime.mode === "live_test" ? <Badge>Live test mode</Badge> : <Badge>Demo fallback enabled</Badge>) : <Badge>Checking runtime...</Badge>}</div>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">End-to-end autonomous business run.</h1>
          <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><p className="max-w-4xl text-lg leading-8 text-muted-foreground">{loading ? "Loading live operations from Prisma..." : steps.length > 0 ? "Live agent events are replayed from the database." : "No operations have been recorded yet. Create a checkout, order, policy decision, or explicit demo run to populate this timeline."}</p><Button variant="outline" onClick={load} disabled={loading}><RefreshCw className="size-4" /> Refresh from DB</Button></div>
          {error ? <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        </Card>
        <Card className="mt-5"><CardContent className="p-5">{loading ? <div className="rounded-lg border border-border/70 bg-background/45 p-8 text-center text-muted-foreground">Loading operations...</div> : <OperationTimeline steps={steps} />}</CardContent></Card>
      </section>
    </main>
  );
}


