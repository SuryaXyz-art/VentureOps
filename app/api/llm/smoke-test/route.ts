import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callHermes, parseHermesJson } from "@/lib/llm/hermes";
import { z } from "zod";

export const dynamic = "force-dynamic";

const smokeSchema = z.object({ status: z.literal("ok") });

export async function POST() {
  try {
    const content = await callHermes([
      { role: "system", content: "Return strict JSON only." },
      { role: "user", content: "Return JSON {\"status\":\"ok\"}." }
    ], { temperature: 0, max_tokens: 40, timeoutMs: 120000 });
    const parsed = parseHermesJson(content, smokeSchema);
    await prisma.agentEvent.create({ data: { role: "System", title: "Hermes smoke test", detail: `Hermes returned ${parsed.status}.`, status: "complete", payloadJson: JSON.stringify({ contentPreview: content.slice(0, 220) }) } });
    return NextResponse.json({ ok: true, contentPreview: content.slice(0, 220) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hermes smoke test failed";
    await prisma.agentEvent.create({ data: { role: "System", title: "Hermes smoke test failed", detail: message, status: "failed", payloadJson: JSON.stringify({ error: message }) } }).catch(() => undefined);
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
