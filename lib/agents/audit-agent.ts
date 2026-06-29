import type { AgentEvent, AuditLogEntry, SpendDecision } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";

export function runAuditAgent(events: AgentEvent[], spendDecisions: SpendDecision[]) {
  const decisionReceipts = new Map(
    spendDecisions.map((decision) => [
      decision.request.id,
      decision.receiptId ?? `blocked_${decision.request.id}`
    ])
  );

  const auditLog: AuditLogEntry[] = events.map((event, index) => {
    const spendRequestId = event.payload && typeof event.payload === "object" && "id" in event.payload
      ? String((event.payload as { id: string }).id)
      : "";

    return {
      eventId: event.id,
      timestamp: event.timestamp ?? new Date("2026-06-27T15:30:00.000Z").toISOString(),
      agent: event.role,
      action: event.action ?? "record_event",
      decision: event.decision ?? "recorded",
      reason: event.reason ?? event.detail,
      policyMatched: event.policyMatched ?? "none",
      receiptId: event.receiptId ?? decisionReceipts.get(spendRequestId) ?? `audit_${String(index + 1).padStart(3, "0")}`
    };
  });

  return createAgentEvent({
    id: "evt_audit_log",
    role: "Audit",
    title: "Audit agent records boardroom decisions",
    detail: `${auditLog.length} structured audit entries captured with event id, timestamp, decision, policy, and receipt reference.`,
    status: "audited",
    action: "write_audit_log",
    decision: "audited",
    reason: "A deterministic audit trail makes every autonomous action reviewable by judges and founders.",
    policyMatched: "audit_every_decision_v1",
    receiptId: "audit_packet_001",
    payload: auditLog
  });
}
