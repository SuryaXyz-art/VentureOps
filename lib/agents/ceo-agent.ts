import { isDemoMode } from "@/lib/config/runtime";
import type { BusinessPlan } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";
import { businessPlanSchema } from "@/lib/llm/schemas";

function deterministicPlan(): BusinessPlan {
  return {
    offerName: "Web3 Founder Signal Brief",
    targetCustomer: "Seed-stage Web3 founders who need fast market, competitor, and positioning intelligence before shipping a launch.",
    priceRecommendation: 19,
    operatingPlan: [
      "Package a 48-hour AI-assisted research report as a fixed-scope paid offer.",
      "Sell through founder communities and direct email instead of paid ads for the first run.",
      "Use only budget-approved public data sources and record every spend decision.",
      "Deliver a concise PDF-style report with market map, competitor scan, and launch recommendations."
    ],
    successMetric: "One paid order with at least $13 gross profit and zero unsafe autonomous spend."
  };
}

function createCeoEvent(plan: BusinessPlan, reason: string) {
  return createAgentEvent({ id: "evt_ceo_plan", role: "CEO", title: "CEO converts goal into business plan", detail: `${plan.offerName} targets ${plan.targetCustomer}`, status: "planning", action: "create_business_plan", decision: "proposed", reason, payload: plan });
}

export function createCeoFailedEvent(error: unknown) {
  const message = error instanceof Error ? error.message : "CEO Agent failed to generate a valid business plan.";
  return createAgentEvent({ id: "evt_ceo_failed", role: "CEO", title: "CEO planning failed", detail: message, status: "failed", action: "create_business_plan", decision: "blocked", reason: message, payload: { error: message } });
}

export function runCeoAgent(goal: string) {
  return createCeoEvent(deterministicPlan(), "A narrow fixed-scope paid research offer can be sold and fulfilled within the $25 operating budget.");
}

export async function runCeoAgentWithLlm(goal: string) {
  if ((process.env.LLM_PROVIDER ?? "mock").toLowerCase() !== "hermes") return runCeoAgent(goal);

  try {
    const { callHermesStructured } = await import("@/lib/llm/hermes");
    const plan = await callHermesStructured([
      {
        role: "system",
        content: 'You are the CEO Agent. Return strict JSON only. operatingPlan MUST be an array of 3-4 short strings. Example: {"offerName":"Web3 Founder Signal Brief","targetCustomer":"Seed-stage Web3 founders","priceRecommendation":19,"operatingPlan":["Sell a fixed-scope report","Launch in founder communities","Use approved data only"],"successMetric":"One paid order with positive margin"}'
      },
      { role: "user", content: `Business goal: ${goal}. Budget is $25. Keep price near $19.` }
    ], businessPlanSchema, { temperature: 0.2, max_tokens: 400, timeoutMs: 45000 }, 0) as BusinessPlan;
    return createCeoEvent(plan, "Creative business planning used Hermes/Nemotron with strict structured JSON. Policy and spend decisions remain deterministic.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "CEO Hermes planning failed";
    const missingKey = message.includes("HERMES_API_KEY is required");
    if (!isDemoMode() && missingKey) {
      throw Object.assign(new Error(message), { agentEvent: createCeoFailedEvent(error) });
    }
    return createCeoEvent(deterministicPlan(), `Hermes creative step unavailable; deterministic CEO planning used: ${message}. Policy and spend remain deterministic.`);
  }
}
