import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import type { ReportSection } from "@/lib/fulfillment/templates";

export interface LlmCompletionResult {
  text?: string;
  sections?: ReportSection[];
  warning?: string;
}

export interface LlmProvider {
  name: "mock" | "nous" | "nvidia" | "hermes";
  complete(prompt: string, input?: ReportGenerationInput): Promise<LlmCompletionResult>;
}
