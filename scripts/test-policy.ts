import { defaultBudgetPolicy, sampleSpendRequests } from "../lib/policy/default-policy";
import { evaluateSpendBatch } from "../lib/policy/evaluate";

const evaluated = evaluateSpendBatch(sampleSpendRequests, defaultBudgetPolicy);

const expected = new Map([
  ["spend_web3data_api", "approved"],
  ["spend_leadlist_lite", "needs_approval"],
  ["spend_production_infra_upgrade", "blocked"],
  ["spend_unknown_ads_boost", "blocked"]
]);

for (const item of evaluated) {
  const expectedDecision = expected.get(item.request.id);
  if (item.evaluation.decision !== expectedDecision) {
    throw new Error(
      `${item.request.id} expected ${expectedDecision}, received ${item.evaluation.decision}`
    );
  }

  if (item.evaluation.matchedRules.length === 0) {
    throw new Error(`${item.request.id} did not include matched policy rules`);
  }

  if (item.evaluation.riskScore < 0 || item.evaluation.riskScore > 100) {
    throw new Error(`${item.request.id} risk score is outside 0-100`);
  }
}

console.log("Policy engine examples passed");
for (const item of evaluated) {
  console.log(
    `${item.request.vendor}: ${item.evaluation.decision} | remaining $${item.evaluation.remainingBudget.toFixed(2)} | risk ${item.evaluation.riskScore}`
  );
}
