"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type StartRunResponse = {
  run?: { id: string };
  checkout?: { checkoutUrl?: string; sessionId?: string; orderId?: string };
  error?: string;
};

export function RunLiveTestDemoButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [llmConnected, setLlmConnected] = useState<boolean | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);

  async function loadLlmStatus() {
    try {
      const response = await fetch("/api/llm/status", { cache: "no-store" });
      const data = await response.json() as { connected?: boolean; lastError?: string | null; provider?: string };
      setLlmConnected(data.provider === "hermes" ? Boolean(data.connected) : true);
      setLlmError(data.lastError ?? null);
    } catch {
      setLlmConnected(false);
      setLlmError("Unable to read LLM status.");
    }
  }

  useEffect(() => {
    void loadLlmStatus();
  }, []);

  async function runLiveDemo() {
    setLoading(true);
    setMessage("Starting live test run...");
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 120000);
      const response = await fetch("/api/runs/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          goal: "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.",
          budgetCents: 2500,
          customerEmail: "founder@example.com",
          mode: "stripe_test"
        })
      });
      window.clearTimeout(timeout);
      const data = await response.json() as StartRunResponse;
      if (!response.ok) throw new Error(data.error ?? "Unable to start live test run");
      setMessage(data.run?.id ? `Run ${data.run.id} created. Opening checkout...` : "Run created. Opening checkout...");
      if (data.checkout?.checkoutUrl) {
        window.location.href = data.checkout.checkoutUrl;
        return;
      }
      setMessage("Run created, but no checkout URL was returned. Check Stripe configuration.");
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === "AbortError" ? "Live test run timed out. Check Hermes, Stripe, and webhook services." : error instanceof Error ? error.message : "Unable to start live test run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {llmConnected === false ? <div className="rounded-lg border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-100">Creative provider is offline. Start NemoHermes on port 8642 for live LLM planning, or use explicit demo mode for offline backup.{llmError ? ` ${llmError}` : ""}</div> : null}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={runLiveDemo} disabled={loading}><Play className="size-4" /> {loading ? "Starting..." : "Start Live Test Run"}</Button>
        <Button size="lg" variant="outline" onClick={() => window.location.reload()}><RefreshCw className="size-4" /> Refresh proof</Button>
        <Button size="lg" variant="outline" asChild><a href="/stripe-revenue"><ExternalLink className="size-4" /> Revenue panel</a></Button>
      </div>
      {message ? <p className="text-sm leading-6 text-muted-foreground">{message}</p> : null}
    </div>
  );
}



