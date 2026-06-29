import { NextResponse } from "next/server";
import { getRuntimeConfig } from "@/lib/config/runtime";
import { getHermesBaseUrl, getHermesModel, getHermesTelemetry } from "@/lib/llm/hermes";

export const dynamic = "force-dynamic";

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

export async function GET() {
  const runtime = getRuntimeConfig();
  const provider = runtime.llmProvider;
  const baseUrl = getHermesBaseUrl();
  const telemetry = getHermesTelemetry();

  return NextResponse.json({
    provider,
    label: provider === "hermes" ? "LLM: Local Hermes + Nemotron 3 Ultra" : "LLM: Mock",
    model: provider === "hermes" ? getHermesModel() : "mock",
    baseUrlHost: provider === "hermes" ? safeHost(baseUrl) : null,
    connected: provider === "hermes" ? telemetry.connected : true,
    lastError: telemetry.lastError ?? null,
    lastResponseId: telemetry.lastResponseId ?? null,
    lastContentPreview: telemetry.lastContentPreview ?? null,
    checkedAt: telemetry.checkedAt ?? null,
    creativeOnly: true,
    deterministicControls: ["CFO Agent", "Spend Agent", "Risk Agent", "Audit Agent", "Policy Engine"]
  });
}
