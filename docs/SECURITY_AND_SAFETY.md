# Security And Safety

## Secret Handling

- `.env` is ignored by git.
- Runtime status endpoints expose booleans and hostnames, not secret values.
- MCP tools call local APIs and do not read environment variables directly.
- Stripe webhook verification is required when `DEMO_MODE=false`.

## Spend Safety

Spend approval is deterministic. LLM output cannot approve spend, change policy, or override blocked categories.

Policy inputs include:

- Total budget
- Spent so far
- Max single spend
- Allowed/blocked vendors
- Allowed/blocked categories
- Approval threshold
- Receipt requirement
- Risk level

## Runtime Boundary

The NVIDIA/NemoClaw-style docs define intended runtime controls:

- Credential boundary
- Network boundary
- Spend boundary
- Audit boundary

The local hackathon build demonstrates these concepts through deterministic policy code, allowlist docs, visible runtime status, receipts, and replayable Prisma records.

## Honest Limitations

- This is a local/test-mode product, not a production finance system.
- Stripe is test mode only.
- NemoClaw/OpenShell alignment is documented and mirrored through local policy controls; it is not a full production sandbox enforcement layer inside the Next app.
- Creative LLM calls may fall back deterministically if Hermes/Nemotron times out.