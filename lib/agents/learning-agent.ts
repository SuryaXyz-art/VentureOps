import { isDemoMode } from "@/lib/config/runtime";
import type { LearningRecommendation, SpendDecision } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";
import { learningRecommendationSchema } from "@/lib/llm/schemas";

function deterministicLearning(spendDecisions: SpendDecision[]): LearningRecommendation {
  const blocked = spendDecisions.filter((decision) => decision.decision === "blocked");
  return { nextExperiment: "Run a concierge delivery sprint for three Web3 founders before buying broader lead data.", pricingImprovement: "Upsell the delivered customer from the $19 entry report to a $49 expanded competitor brief.", riskImprovement: blocked.length > 0 ? "Add a founder approval queue for spends above $8 so LeadList Lite can be reviewed without weakening autonomous controls." : "Keep the same approval envelope and expand only after repeatable positive margin." };
}

function createLearningEvent(learning: LearningRecommendation, reason: string) {
  return createAgentEvent({ id: "evt_learning_recommendation", role: "Learning", title: "Learning agent suggests next operating cycle", detail: "Recommended a concierge validation sprint, pricing lift, and approval queue improvement.", status: "idle", action: "recommend_next_cycle", decision: "recommended", reason, payload: learning });
}

export function createLearningFailedEvent(error: unknown) {
  const message = error instanceof Error ? error.message : "Learning Agent failed to generate valid recommendations.";
  return createAgentEvent({ id: "evt_learning_failed", role: "Learning", title: "Learning recommendation failed", detail: message, status: "failed", action: "recommend_next_cycle", decision: "blocked", reason: message, payload: { error: message } });
}

export function runLearningAgent(spendDecisions: SpendDecision[]) {
  return createLearningEvent(deterministicLearning(spendDecisions), "The first run proves demand can be tested profitably while blocked spend reveals where approval UX is needed.");
}

export async function runLearningAgentWithLlm(spendDecisions: SpendDecision[]) {
  if ((process.env.LLM_PROVIDER ?? "mock").toLowerCase() !== "hermes") return runLearningAgent(spendDecisions);

  try {
    const { callHermesStructured } = await import("@/lib/llm/hermes");
    const summary = spendDecisions.map((d) => `${d.request.vendor}: ${d.decision}`).join("; ");
    const learning = await callHermesStructured([
      { role: "system", content: 'You are the Learning Agent. Return strict JSON only: {"nextExperiment":"...","pricingImprovement":"...","riskImprovement":"..."}' },
      { role: "user", content: `Suggest next experiment from spend outcomes: ${summary}` }
    ], learningRecommendationSchema, { temperature: 0.2, max_tokens: 300, timeoutMs: 30000 }, 0);
    return createLearningEvent(learning, "Creative learning recommendations used Hermes/Nemotron with strict structured JSON. Spend policy remains deterministic.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Learning Hermes generation failed";
    const missingKey = message.includes("HERMES_API_KEY is required");
    if (!isDemoMode() && missingKey) {
      throw Object.assign(new Error(message), { agentEvent: createLearningFailedEvent(error) });
    }
    return createLearningEvent(deterministicLearning(spendDecisions), `Hermes creative step unavailable; deterministic learning recommendations used: ${message}. Policy and spend remain deterministic.`);
  }
}
