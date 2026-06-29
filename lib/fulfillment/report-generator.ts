import { getLlmProvider } from "@/lib/llm/provider";
import { deterministicReportSections, renderMarkdownReport, reportTitle, type GeneratedReport, type ReportTemplateInput } from "@/lib/fulfillment/templates";

export type ReportGenerationInput = ReportTemplateInput;

export async function generateCustomerReport(input: ReportGenerationInput = {}): Promise<GeneratedReport> {
  const provider = getLlmProvider();
  const prompt = `Generate ${reportTitle} for ${input.customerName ?? "a Web3 founder"}. Product: ${input.productName ?? "AI Web3 Founder Research Report"}. Return concise JSON sections only.`;

  try {
    const providerResult = await provider.complete(prompt, input);
    const sections = providerResult.sections?.length ? providerResult.sections : deterministicReportSections(input);
    return {
      title: reportTitle,
      sections,
      markdown: renderMarkdownReport(reportTitle, sections),
      provider: provider.name,
      warning: providerResult.warning
    };
  } catch (error) {
    const sections = deterministicReportSections(input);
    return {
      title: reportTitle,
      sections,
      markdown: renderMarkdownReport(reportTitle, sections),
      provider: "mock",
      warning: `Hermes report generation failed or timed out, so deterministic fallback content was used visibly: ${error instanceof Error ? error.message : "unknown error"}`
    };
  }
}