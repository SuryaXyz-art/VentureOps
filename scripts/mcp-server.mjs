#!/usr/bin/env node

const appUrl = (process.env.VENTUREOPS_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
const serverInfo = { name: "ventureops-autopilot", version: "0.1.0" };
let buffer = Buffer.alloc(0);

const tools = [
  {
    name: "runtime_status",
    description: "Return safe VentureOps runtime configuration status without exposing secrets.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "hermes_smoke_test",
    description: "Call the app Hermes smoke test endpoint. Useful for verifying local NemoHermes wiring.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "latest_run",
    description: "Return the latest live/test BusinessRun with related events, orders, receipts, policy decisions, reports, and P&L.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "orders",
    description: "Return customer orders from the Prisma-backed app API. Optionally filter by Stripe checkout session id.",
    inputSchema: {
      type: "object",
      properties: { sessionId: { type: "string", description: "Optional Stripe Checkout Session id." } },
      additionalProperties: false
    }
  },
  {
    name: "receipts",
    description: "Return audit receipts and policy decisions from the Prisma-backed app API.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "pnl",
    description: "Return the latest Prisma-backed profit and loss snapshot.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "start_business_run",
    description: "Start a live Stripe-test BusinessRun. Creative content may use Hermes; spend/risk/policy remain deterministic.",
    inputSchema: {
      type: "object",
      required: ["goal", "budgetCents"],
      properties: {
        goal: { type: "string", minLength: 10 },
        budgetCents: { type: "integer", minimum: 1, default: 2500 },
        customerEmail: { type: "string", description: "Optional customer email for the checkout/order." }
      },
      additionalProperties: false
    }
  },
  {
    name: "create_stripe_checkout",
    description: "Create a real Stripe test-mode Checkout Session through the app API when Stripe keys are configured.",
    inputSchema: {
      type: "object",
      properties: {
        customerEmail: { type: "string", default: "founder@example.com" },
        customerName: { type: "string", default: "MCP Founder" },
        productName: { type: "string", default: "AI Web3 Founder Research Report" },
        amountCents: { type: "integer", minimum: 50, default: 1900 },
        businessRunId: { type: "string", description: "Optional existing BusinessRun id." }
      },
      additionalProperties: false
    }
  }
];

function send(message) {
  const json = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`);
}

function makeTextResult(data, isError = false) {
  return {
    content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
    isError
  };
}

async function appFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 30000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${appUrl}${path}`, {
      method: options.method ?? "GET",
      headers: { "content-type": "application/json", ...(options.headers ?? {}) },
      body: options.body == null ? undefined : JSON.stringify(options.body),
      signal: controller.signal
    });
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!response.ok) {
      throw new Error(`App API ${response.status} ${response.statusText}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
    }
    return body;
  } catch (error) {
    if (error?.name === "AbortError") throw new Error(`Timed out calling ${path} after ${timeoutMs}ms.`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function callTool(name, args = {}) {
  switch (name) {
    case "runtime_status":
      return appFetch("/api/runtime/status");
    case "hermes_smoke_test":
      return appFetch("/api/llm/smoke-test", { method: "POST", timeoutMs: 150000 });
    case "latest_run":
      return appFetch("/api/runs/latest");
    case "orders": {
      const query = args.sessionId ? `?sessionId=${encodeURIComponent(args.sessionId)}` : "";
      return appFetch(`/api/orders${query}`);
    }
    case "receipts":
      return appFetch("/api/receipts");
    case "pnl":
      return appFetch("/api/pnl");
    case "start_business_run":
      return appFetch("/api/runs/start", {
        method: "POST",
        timeoutMs: 390000,
        body: {
          goal: args.goal,
          budgetCents: args.budgetCents ?? 2500,
          customerEmail: args.customerEmail,
          mode: "stripe_test"
        }
      });
    case "create_stripe_checkout":
      return appFetch("/api/stripe/create-checkout", {
        method: "POST",
        timeoutMs: 60000,
        body: {
          customerEmail: args.customerEmail ?? "founder@example.com",
          customerName: args.customerName ?? "MCP Founder",
          productName: args.productName ?? "AI Web3 Founder Research Report",
          amountCents: args.amountCents ?? 1900,
          businessRunId: args.businessRunId
        }
      });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handle(message) {
  if (!message || message.jsonrpc !== "2.0") return;
  const { id, method, params } = message;

  if (id == null) return;

  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? "2024-11-05",
          capabilities: { tools: {} },
          serverInfo
        }
      });
      return;
    }

    if (method === "ping") {
      send({ jsonrpc: "2.0", id, result: {} });
      return;
    }

    if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools } });
      return;
    }

    if (method === "tools/call") {
      const result = await callTool(params?.name, params?.arguments ?? {});
      send({ jsonrpc: "2.0", id, result: makeTextResult(result) });
      return;
    }

    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (error) {
    send({
      jsonrpc: "2.0",
      id,
      result: makeTextResult(error instanceof Error ? error.message : "Unknown MCP server error", true)
    });
  }
}

function readMessages() {
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const header = buffer.slice(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + length;
    if (buffer.length < messageEnd) return;
    const json = buffer.slice(messageStart, messageEnd).toString("utf8");
    buffer = buffer.slice(messageEnd);
    try {
      void handle(JSON.parse(json));
    } catch (error) {
      console.error("Invalid MCP message", error);
    }
  }
}

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  readMessages();
});

process.stdin.on("end", () => process.exit(0));
process.stderr.write(`VentureOps MCP server connected to ${appUrl}\n`);