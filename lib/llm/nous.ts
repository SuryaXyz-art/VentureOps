import { deterministicReportSections } from "@/lib/fulfillment/templates";
import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import type { LlmProvider } from "@/lib/llm/types";

export async function callNousAdapter(prompt: string) {
  if (!process.env.NOUS_API_KEY) {
    return null;
  }

  return {
    provider: "nous",
    text: `Nous adapter placeholder for prompt: ${prompt.slice(0, 80)}`
  };
}

export const nousProvider: LlmProvider = {
  name: "nous",
  async complete(prompt: string, input?: ReportGenerationInput) {
    const result = await callNousAdapter(prompt);
    if (!result) {
      return { sections: deterministicReportSections(input ?? {}) };
    }
    return { text: result.text, sections: deterministicReportSections(input ?? {}) };
  }
};
