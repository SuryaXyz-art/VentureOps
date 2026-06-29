import type { AgentEvent, AgentRole } from "@/lib/agents/types";

export function createAgentEvent<TPayload>({
  id,
  role,
  title,
  detail,
  status,
  action,
  decision,
  reason,
  policyMatched = "none",
  receiptId,
  amount,
  payload
}: Omit<AgentEvent<TPayload>, "timestamp"> & { role: AgentRole }) {
  return {
    id,
    role,
    title,
    detail,
    status,
    action,
    decision,
    reason,
    policyMatched,
    receiptId,
    amount,
    payload,
    timestamp: new Date("2026-06-27T15:30:00.000Z").toISOString()
  } satisfies AgentEvent<TPayload>;
}
