type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

type JsonRecord = Record<string, unknown>;

const baseUrl = (process.env.VENTUREOPS_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const goal = "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.";
const results: CheckResult[] = [];

function pass(name: string, detail: string) {
  results.push({ name, ok: true, detail });
}

function fail(name: string, detail: string) {
  results.push({ name, ok: false, detail });
}

async function readJson(path: string, init?: RequestInit): Promise<{ status: number; body: JsonRecord }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const body = await response.json().catch(() => ({})) as JsonRecord;
  return { status: response.status, body };
}

function describeError(body: JsonRecord) {
  return typeof body.error === "string" ? body.error : JSON.stringify(body).slice(0, 240);
}

async function checkRuntime() {
  const { status, body } = await readJson("/api/runtime/status");
  if (status === 200) pass("runtime status", `mode=${String(body.mode)} demoMode=${String(body.demoMode)} stripeConfigured=${String(body.stripeConfigured)}`);
  else fail("runtime status", `HTTP ${status}: ${describeError(body)}`);
}

async function checkHermesSmoke() {
  const { status, body } = await readJson("/api/llm/smoke-test", { method: "POST", body: "{}" });
  if (status === 200 && body.ok === true) pass("Hermes smoke test", "Hermes returned structured ok JSON.");
  else fail("Hermes smoke test", `HTTP ${status}: ${describeError(body)}. If using fallback/demo mode, this failure is expected until NemoHermes is connected.`);
}

async function checkStartRun() {
  const { status, body } = await readJson("/api/runs/start", {
    method: "POST",
    body: JSON.stringify({ goal, budgetCents: 2500, customerEmail: "founder+verify@example.com", mode: "stripe_test" })
  });
  const run = body.run as JsonRecord | undefined;
  if (status === 200 && run?.id) pass("start $25 business run", `run=${String(run.id)} status=${String(run.status ?? "unknown")}`);
  else fail("start $25 business run", `HTTP ${status}: ${describeError(body)}`);
}

async function checkLatestRun() {
  const { status, body } = await readJson("/api/runs/latest");
  const run = body.run as JsonRecord | undefined;
  if (status === 200 && run?.id) pass("latest run", `run=${String(run.id)} status=${String(run.status ?? "unknown")}`);
  else fail("latest run", `HTTP ${status}: ${describeError(body)}`);
}

async function checkCollection(path: string, key: string, name: string) {
  const { status, body } = await readJson(path);
  const rows = body[key];
  if (status === 200 && Array.isArray(rows)) pass(name, `${rows.length} record(s).`);
  else fail(name, `HTTP ${status}: expected array key '${key}', got ${describeError(body)}`);
}

async function checkPnl() {
  const { status, body } = await readJson("/api/pnl");
  const pnl = body.pnl as JsonRecord | undefined;
  if (status === 200 && pnl) pass("P&L", `revenue=${String(pnl.revenue)} costs=${String(pnl.approvedCosts)} profit=${String(pnl.netProfit)}`);
  else fail("P&L", `HTTP ${status}: ${describeError(body)}`);
}

async function main() {
  console.log(`Verifying VentureOps live stack at ${baseUrl}`);
  await checkRuntime();
  await checkHermesSmoke();
  await checkStartRun();
  await checkLatestRun();
  await checkCollection("/api/orders", "orders", "orders endpoint");
  await checkCollection("/api/receipts", "receipts", "receipts endpoint");
  await checkPnl();

  const failed = results.filter((result) => !result.ok);
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}: ${result.detail}`);
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll live-stack checks passed.");
}

main().catch((error) => {
  console.error(`FAIL verifier crashed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
