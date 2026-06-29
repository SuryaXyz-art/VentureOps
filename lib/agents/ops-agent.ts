import type { BusinessPlan, FulfillmentPlan } from "@/lib/agents/types";
import { createAgentEvent } from "@/lib/agents/event-factory";

export function runOpsAgent(plan: BusinessPlan) {
  const fulfillment: FulfillmentPlan = {
    reportTitle: `${plan.offerName}: Market Intelligence Report`,
    reportSections: [
      "Executive summary",
      "Target customer pain map",
      "Competitor and substitute scan",
      "Distribution channels for first 10 customers",
      "Launch risks and recommended next actions"
    ],
    dataRequirements: [
      "Public founder/company profiles",
      "Competitor landing pages",
      "Recent Web3 launch posts",
      "Category pricing examples"
    ],
    deliveryChecklist: [
      "Confirm customer segment",
      "Collect approved public data",
      "Generate research brief",
      "Attach receipts and policy decisions",
      "Deliver report with next action memo"
    ]
  };

  return createAgentEvent({
    id: "evt_ops_fulfillment",
    role: "Ops",
    title: "Ops creates fulfillment plan",
    detail: `${fulfillment.reportTitle} will be delivered with ${fulfillment.reportSections.length} sections and an audit packet.`,
    status: "fulfilled",
    action: "create_fulfillment_plan",
    decision: "fulfilled",
    reason: "The fulfillment plan uses only approved data requirements and produces a customer-ready report.",
    payload: fulfillment
  });
}
