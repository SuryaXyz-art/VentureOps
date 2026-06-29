import { deterministicReportSections } from "@/lib/fulfillment/templates";
import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import type { LlmProvider } from "@/lib/llm/types";

export const mockProvider: LlmProvider = {
  name: "mock",
  async complete(_prompt: string, input?: ReportGenerationInput) {
    return { sections: deterministicReportSections(input ?? {}) };
  }
};
