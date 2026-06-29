export type AgentRole =
  | "CEO"
  | "CFO"
  | "Growth"
  | "Stripe"
  | "Ops"
  | "Risk"
  | "Spend"
  | "Audit"
  | "Learning"
  | "System";

export type AgentEventStatus =
  | "idle"
  | "planning"
  | "executing"
  | "approved"
  | "blocked"
  | "fulfilled"
  | "audited"
  | "queued"
  | "running"
  | "complete"
  | "failed";

export type AgentDecision = "proposed" | "approved" | "needs_approval" | "blocked" | "fulfilled" | "audited" | "recommended";

export interface AgentEvent<TPayload = unknown> {
  id: string;
  role: AgentRole;
  title: string;
  detail: string;
  status: AgentEventStatus;
  amount?: number;
  timestamp?: string;
  action?: string;
  decision?: AgentDecision;
  reason?: string;
  policyMatched?: string;
  receiptId?: string;
  payload?: TPayload;
}

export interface BusinessPlan {
  offerName: string;
  targetCustomer: string;
  priceRecommendation: number;
  operatingPlan: string[];
  successMetric: string;
}

export interface BudgetPolicy {
  totalBudget: number;
  maxSingleSpend: number;
  allowedVendors: string[];
  blockedCategories: SpendCategory[];
  approvalThreshold: number;
  receiptRequirement: boolean;
}

export type SpendCategory = "data" | "leads" | "ads" | "infra" | "infrastructure" | "unknown";

export interface GrowthPackage {
  landingCopy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  launchTweet: string;
  emailPitch: string;
  customerPersonas: string[];
}

export interface StripePreparation {
  productName: string;
  price: number;
  checkoutDescription: string;
  customerRecordPlaceholder: {
    name: string;
    email: string;
    segment: string;
  };
}

export interface FulfillmentPlan {
  reportTitle: string;
  reportSections: string[];
  dataRequirements: string[];
  deliveryChecklist: string[];
}

export interface SpendRequest {
  id: string;
  vendor: string;
  amount: number;
  category: SpendCategory;
  purpose: string;
  risk: "low" | "medium" | "high";
}

export interface SpendDecision {
  request: SpendRequest;
  decision: "approved" | "needs_approval" | "blocked";
  reason: string;
  policyMatched: string;
  receiptId?: string;
}

export interface AuditLogEntry {
  eventId: string;
  timestamp: string;
  agent: AgentRole;
  action: string;
  decision: AgentDecision | "recorded";
  reason: string;
  policyMatched: string;
  receiptId: string;
}

export interface LearningRecommendation {
  nextExperiment: string;
  pricingImprovement: string;
  riskImprovement: string;
}

export interface BoardroomMessage {
  id: string;
  timestamp: string;
  agent: AgentRole;
  message: string;
  decision: AgentDecision;
  emphasis?: "normal" | "veto" | "win";
}

export interface WorkflowResult {
  id: string;
  goal: string;
  createdAt: string;
  plan: BusinessPlan;
  budgetPolicy: BudgetPolicy;
  growth: GrowthPackage;
  stripe: StripePreparation;
  fulfillment: FulfillmentPlan;
  spendRequests: SpendRequest[];
  spendDecisions: SpendDecision[];
  auditLog: AuditLogEntry[];
  learning: LearningRecommendation;
  events: AgentEvent[];
  boardroom: BoardroomMessage[];
  pnl: {
    revenue: number;
    approvedCosts: number;
    profit: number;
    blockedSpend: number;
  };
}

export interface AuditReceipt {
  id: string;
  source: string;
  amount: number;
  decision: "approved" | "blocked" | "recorded";
  note: string;
}

export interface DemoRun {
  goal: string;
  budget: number;
  revenue: number;
  costs: number;
  profit: number;
  blockedRiskValue: number;
  checkoutUrl: string;
  events: AgentEvent[];
  spendRequests: SpendRequest[];
  receipts: AuditReceipt[];
  report: string;
  nextActions: string[];
}




