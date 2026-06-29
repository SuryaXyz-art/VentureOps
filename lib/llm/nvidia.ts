import { deterministicReportSections } from "@/lib/fulfillment/templates";
import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import type { LlmProvider } from "@/lib/llm/types";

export async function callNvidiaAdapter(prompt: string) {
  if (!process.env.NVIDIA_API_KEY) {
    return null;
  }

  return {
    provider: "nvidia",
    text: `NVIDIA adapter placeholder for prompt: ${prompt.slice(0, 80)}`
  };
}

export const nvidiaProvider: LlmProvider = {
  name: "nvidia",
  async complete(prompt: string, input?: ReportGenerationInput) {
    const result = await callNvidiaAdapter(prompt);
    if (!result) {
      return { sections: deterministicReportSections(input ?? {}) };
    }
    return { text: result.text, sections: deterministicReportSections(input ?? {}) };
  }
};
