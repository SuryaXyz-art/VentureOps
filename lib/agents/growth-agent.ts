import { isDemoMode } from "@/lib/config/runtime";
import type { BusinessPlan, GrowthPackage } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";
import { growthPackageSchema } from "@/lib/llm/schemas";

function deterministicGrowth(): GrowthPackage {
  return {
    landingCopy: { headline: "Know your Web3 market before your next launch window closes.", subheadline: "Get a 48-hour founder-ready research brief with market signals, competitor positioning, and a practical launch recommendation.", cta: "Buy the $19 Web3 Founder Signal Brief" },
    launchTweet: "Launching a tiny AI research desk for Web3 founders: market map, competitor scan, and launch memo in 48 hours. First briefs are $19 while I validate demand.",
    emailPitch: "I am running a focused Web3 research brief service for founders who need quick market clarity before launch. For $19, you get a 48-hour report with competitor notes, positioning angles, and next actions.",
    customerPersonas: ["Protocol founder preparing a grant-funded product launch", "Web3 tooling founder choosing a beachhead segment", "Crypto infra operator validating competitor positioning"]
  };
}

function createGrowthEvent(plan: BusinessPlan, growth: GrowthPackage, reason: string) {
  return createAgentEvent({ id: "evt_growth_package", role: "Growth", title: "Growth creates offer copy", detail: "Landing copy, launch tweet, email pitch, and three customer personas are ready.", status: "executing", action: "create_growth_package", decision: "proposed", reason: `${reason} The copy anchors ${plan.offerName} to a fast, concrete founder outcome.`, payload: growth });
}

export function createGrowthFailedEvent(error: unknown) {
  const message = error instanceof Error ? error.message : "Growth Agent failed to generate valid offer copy.";
  return createAgentEvent({ id: "evt_growth_failed", role: "Growth", title: "Growth copy failed", detail: message, status: "failed", action: "create_growth_package", decision: "blocked", reason: message, payload: { error: message } });
}

export function runGrowthAgent(plan: BusinessPlan) {
  return createGrowthEvent(plan, deterministicGrowth(), "Deterministic growth copy was used.");
}

export async function runGrowthAgentWithLlm(plan: BusinessPlan) {
  if ((process.env.LLM_PROVIDER ?? "mock").toLowerCase() !== "hermes") return runGrowthAgent(plan);

  try {
    const { callHermesStructured } = await import("@/lib/llm/hermes");
    const growth = await callHermesStructured([
      {
        role: "system",
        content: 'You are the Growth Agent. Return strict JSON only. customerPersonas MUST be exactly 3 strings. Example: {"landingCopy":{"headline":"...","subheadline":"...","cta":"..."},"launchTweet":"...","emailPitch":"...","customerPersonas":["persona 1","persona 2","persona 3"]}'
      },
      { role: "user", content: `Create offer copy for "${plan.offerName}" priced at $${plan.priceRecommendation} targeting ${plan.targetCustomer}.` }
    ], growthPackageSchema, { temperature: 0.3, max_tokens: 500, timeoutMs: 45000 }, 0) as GrowthPackage;
    return createGrowthEvent(plan, growth, "Creative offer copy used Hermes/Nemotron with strict structured JSON.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Growth Hermes generation failed";
    const missingKey = message.includes("HERMES_API_KEY is required");
    if (!isDemoMode() && missingKey) {
      throw Object.assign(new Error(message), { agentEvent: createGrowthFailedEvent(error) });
    }
    return createGrowthEvent(plan, deterministicGrowth(), `Hermes creative step unavailable; deterministic growth copy used: ${message}. Policy and spend remain deterministic.`);
  }
}
