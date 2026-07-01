# NemoClaw / OpenShell Proof Guide

VentureOps Autopilot includes app-level spend policy, approvals, receipts, and audit logs. NemoClaw/OpenShell runtime enforcement is external proof and must be demonstrated from the terminal when the runtime is actually running.

## 1. Confirm Hermes/OpenShell runtime status

```bash
nemohermes hermes status
```

Expected proof: sandbox name, active model/provider, gateway health, and local API endpoint.

## 2. Show sandbox list

```bash
nemohermes sandbox list
```

If your installed CLI uses a different command, use the equivalent sandbox listing command and capture the output in the demo terminal.

## 3. Show sandbox health/logs

```bash
nemohermes hermes logs --follow
```

Optional health checks depend on the installed NemoHermes/OpenShell CLI version. Use the CLI's documented health or dashboard command if present.

## 4. Verify the OpenAI-compatible models endpoint

```bash
curl http://127.0.0.1:8642/v1/models
```

Expected proof: a JSON model list that includes the active Hermes model. For the local Hermes agent bridge, `hermes-agent` is the recommended app model ID.

## 5. Run the VentureOps Hermes smoke test

Start VentureOps first:

```bash
npm run dev:quiet
```

Then run:

```bash
curl -X POST http://localhost:3000/api/llm/smoke-test
```

Expected proof: `{ "ok": true }` with a content preview. If this fails, the app will visibly label Hermes as offline/fallback instead of claiming live creative-agent execution.

## 6. Verify runtime status from VentureOps

```bash
curl http://localhost:3000/api/runtime/status
```

Expected proof: Stripe/Hermes configuration status without exposing secrets.

## Honest Claim Boundary

- VentureOps enforces app-level spend control through deterministic policy code, approval queue actions, receipts, and P&L records.
- NemoClaw/OpenShell enforcement is proven only when the runtime is started and its terminal/dashboard status is shown.
- Hermes/Nemotron creative calls may fall back to deterministic content; fallback is visibly labeled in app status and agent events.
- Stripe is test mode only. No production money movement is claimed.
