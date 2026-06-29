# VentureOps Autopilot MCP

This folder contains a local MCP stdio configuration for connecting MCP-compatible clients to VentureOps Autopilot.

The server does not read Stripe, Hermes, or database secrets. It only calls the local Next.js app APIs at `VENTUREOPS_APP_URL`.

## Start The App

```bash
npm run build
npm run start
```

The app should be reachable at:

```text
http://localhost:3000
```

## MCP Server Command

```bash
node scripts/mcp-server.mjs
```

For MCP clients, use `mcp/ventureops-autopilot.mcp.json` and adjust `cwd` if your repo path changes.

## Exposed Tools

- `runtime_status`
- `hermes_smoke_test`
- `latest_run`
- `orders`
- `receipts`
- `pnl`
- `start_business_run`
- `create_stripe_checkout`

## Safety Boundary

Hermes/Nemotron can generate creative planning/report content, but spend, risk, policy, audit, and P&L stay inside deterministic app code. The MCP server never exposes environment variables or API keys.