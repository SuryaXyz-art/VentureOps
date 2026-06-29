import { startBusinessRun } from "../lib/runs/start-business-run";

async function main() {
  const result = await startBusinessRun({
    goal: "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.",
    budgetCents: 2500,
    customerEmail: "founder+scripttest@example.com",
    mode: "stripe_test"
  });

  console.log("run_id", result.run?.id);
  console.log("checkout_url", result.checkout?.checkoutUrl ?? "missing");
  console.log("checkout_session", result.checkout?.sessionId ?? "missing");
  console.log("status", result.run?.status);
}

main().catch((error) => {
  console.error("live_run_failed", error instanceof Error ? error.message : error);
  process.exit(1);
});