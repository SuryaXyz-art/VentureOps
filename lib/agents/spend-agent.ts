import type { SpendRequest } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";

export function runSpendAgent() {
  const requests: SpendRequest[] = [
    {
      id: "spend_web3data_api",
      vendor: "Web3Data API",
      amount: 6,
      category: "data",
      purpose: "Buy a small public Web3 company lookup batch for the research report.",
      risk: "low"
    },
    {
      id: "spend_leadlist_lite",
      vendor: "LeadList Lite",
      amount: 9,
      category: "data",
      purpose: "Buy a small founder lead sample for launch validation.",
      risk: "medium"
    },
    {
      id: "spend_infra_upgrade",
      vendor: "Production Infra Upgrade",
      amount: 60,
      category: "infra",
      purpose: "Upgrade production hosting before revenue is validated.",
      risk: "high"
    }
  ];

  return createAgentEvent({
    id: "evt_spend_requests",
    role: "Spend",
    title: "Spend agent requests three tool purchases",
    detail: "Requested Web3Data API for $6, LeadList Lite for $9, and Production Infra Upgrade for $60.",
    status: "executing",
    action: "request_spend",
    decision: "proposed",
    reason: "The report needs public data enrichment, but every spend must pass CFO and Risk policy first.",
    payload: requests
  });
}
