import type { AgentEvent, AuditReceipt, DemoRun, SpendRequest } from "@/lib/agents/types";

export const demoGoal =
  "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.";

export const operatingLoop = ["Goal", "Plan", "Budget", "Sell", "Spend", "Fulfill", "Audit", "Learn"];

export const agentCards = [
  { role: "CEO", title: "CEO Agent", status: "planning", description: "Turns the founder goal into a focused micro-business thesis." },
  { role: "CFO", title: "CFO Agent", status: "approved", description: "Creates the budget envelope, margin target, and spend policy." },
  { role: "Growth", title: "Growth Agent", status: "executing", description: "Packages the offer, landing copy, launch post, and buyer promise." },
  { role: "Stripe", title: "Stripe Agent", status: "approved", description: "Creates test-mode product, price, customer, and checkout link." },
  { role: "Ops", title: "Ops Agent", status: "fulfilled", description: "Generates the customer research report and delivery packet." },
  { role: "Risk", title: "Risk Agent", status: "blocked", description: "Blocks unsafe, high-risk, or budget-breaking tool spend." },
  { role: "Audit", title: "Audit Agent", status: "audited", description: "Records receipts, decisions, proof of work, and final P&L." },
  { role: "Learning", title: "Learning Agent", status: "idle", description: "Recommends the next experiment after the operating cycle." }
] as const;

export const seededSpendRequests: SpendRequest[] = [
  {
    id: "spend_web3data_api",
    vendor: "Web3Data API",
    amount: 6,
    category: "data",
    purpose: "Buy compliant public Web3 company enrichment for the market signal report.",
    risk: "low"
  },
  {
    id: "spend_infra_upgrade",
    vendor: "Production Infra Upgrade",
    amount: 60,
    category: "infrastructure",
    purpose: "Upgrade production infrastructure before revenue is validated.",
    risk: "high"
  }
];

export const seededEvents: AgentEvent[] = [
  { id: "ceo-plan", role: "CEO", title: "Business plan generated", detail: "Micro-business: paid AI research reports for Web3 founders with a $19 entry offer.", status: "planning" },
  { id: "cfo-budget", role: "CFO", title: "$25 operating policy created", detail: "Allowed: public data under $8. Blocked: unsafe, high-risk, or budget-breaking spend.", status: "approved" },
  { id: "growth-offer", role: "Growth", title: "Offer and launch copy drafted", detail: "Landing promise, checkout CTA, and launch post prepared for founder communities.", status: "executing" },
  { id: "stripe-offer", role: "Stripe", title: "Paid offer created", detail: "Product, price, customer, and checkout link ready in demo mode.", status: "approved", amount: 19 },
  { id: "ops-report", role: "Ops", title: "Customer order fulfilled", detail: "Generated the Web3 Founder Market Signal Report and attached it to the audit packet.", status: "fulfilled" },
  { id: "risk-approve", role: "Risk", title: "Safe data spend approved", detail: "Approved $6 Web3Data API spend under the budget firewall.", status: "approved", amount: 6 },
  { id: "risk-block", role: "Risk", title: "Risky spend blocked", detail: "Blocked $60 Production Infra Upgrade before execution and preserved the founder budget.", status: "blocked", amount: 60 },
  { id: "audit-packet", role: "Audit", title: "Receipts and decisions recorded", detail: "Audit packet contains checkout creation, order fulfillment, spend approval, and blocked risk.", status: "audited" },
  { id: "learning-loop", role: "Learning", title: "Next experiment selected", detail: "Upsell a $49 expanded competitor brief after the first delivery validates demand.", status: "idle" }
];

export const seededReceipts: AuditReceipt[] = [
  { id: "receipt_stripe_01", source: "Demo Stripe Fallback", amount: 19, decision: "recorded", note: "Created product, price, customer, and checkout link: /demo-checkout/web3-research-report" },
  { id: "receipt_spend_web3data_api", source: "Web3Data API", amount: 6, decision: "approved", note: "Approved within budget, declared purpose, and low-risk data category." },
  { id: "receipt_spend_infra_upgrade", source: "Production Infra Upgrade", amount: 60, decision: "blocked", note: "Blocked because infrastructure spend exceeded max single spend and remaining budget." }
];

export const seededReport = [
  "Market signal: Web3 infrastructure founders are buying narrow, decision-ready research on distribution, compliance posture, and competitor positioning.",
  "Offer: AI Web3 Founder Research Report with market map, competitor scan, risk notes, and a founder-ready launch memo.",
  "Recommended next action: upsell a $49 expanded competitor brief and add founder approval for spend above $8."
].join("\n\n");

export const seededDemoRun: DemoRun = {
  goal: demoGoal,
  budget: 25,
  revenue: 19,
  costs: 6,
  profit: 13,
  blockedRiskValue: 60,
  checkoutUrl: "/demo-checkout/web3-research-report",
  events: seededEvents,
  spendRequests: seededSpendRequests,
  receipts: seededReceipts,
  report: seededReport,
  nextActions: [
    "Upsell a $49 expanded competitor brief after delivery.",
    "Run a second founder-community campaign once CAC is validated.",
    "Route spends above $8 to founder approval before execution."
  ]
};
