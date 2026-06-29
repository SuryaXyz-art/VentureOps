export interface ReportSection {
  heading: string;
  body: string;
}

export interface GeneratedReport {
  title: string;
  sections: ReportSection[];
  markdown: string;
  provider: string;
  warning?: string;
}

export interface ReportTemplateInput {
  orderId?: string;
  customerName?: string | null;
  customerEmail?: string | null;
  productName?: string;
  goal?: string;
}

export const reportTitle = "Web3 Founder Market Signal Report";

export const requiredReportSections = [
  "Executive Summary",
  "Market Narrative",
  "Opportunity Map",
  "Competitor Signals",
  "Recommended Founder Actions",
  "Risk Notes",
  "Data Sources Used",
  "Agent Audit Summary"
];

export function deterministicReportSections(input: ReportTemplateInput = {}): ReportSection[] {
  const customer = input.customerName || "Web3 founder";
  return [
    {
      heading: "Executive Summary",
      body: `${customer} ordered a focused market-signal report for a Web3 founder audience. The strongest immediate opportunity is a narrow, paid intelligence offer for teams making launch, positioning, or ecosystem partnership decisions under time pressure.`
    },
    {
      heading: "Market Narrative",
      body: "Web3 founders are shifting from broad hype cycles toward pragmatic infrastructure, distribution, and trust-building work. Buyers reward concise evidence, visible risk controls, and specific recommendations over sprawling research decks."
    },
    {
      heading: "Opportunity Map",
      body: "Best near-term segments: protocol tooling founders validating beachhead users, infrastructure teams preparing grant or partner launches, and founder-led service teams packaging expertise into repeatable paid briefs."
    },
    {
      heading: "Competitor Signals",
      body: "The competitive field includes boutique research shops, analyst newsletters, token intelligence dashboards, and generic AI research tools. VentureOps can differentiate through operational proof: checkout, fulfillment, spend controls, receipts, and an audit-ready P&L."
    },
    {
      heading: "Recommended Founder Actions",
      body: "Ship a $19 entry report, collect three customer interviews, offer a $199 deep-dive upgrade, and keep acquisition manual until conversion and fulfillment quality are proven."
    },
    {
      heading: "Risk Notes",
      body: "Avoid unverified paid datasets, token-prediction claims, private wallet data, and unbounded infrastructure spend. Any spend above the approval threshold should move to founder review before execution."
    },
    {
      heading: "Data Sources Used",
      body: "Seeded demo sources: public founder profiles, Web3 launch posts, competitor landing pages, pricing patterns from research products, and the VentureOps budget-firewall policy packet."
    },
    {
      heading: "Agent Audit Summary",
      body: `CEO scoped the offer, CFO set the budget envelope, Growth prepared the buyer promise, Stripe recorded the paid order path, Ops generated this report, Risk blocked unsafe spend, and Audit marked the order as delivered. Order reference: ${input.orderId ?? "demo-order"}.`
    }
  ];
}

export function renderMarkdownReport(title: string, sections: ReportSection[]) {
  return [`# ${title}`, ...sections.map((section) => `## ${section.heading}\n\n${section.body}`)].join("\n\n");
}

