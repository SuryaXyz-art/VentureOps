import { deterministicReportSections } from "@/lib/fulfillment/templates";
import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import { generatedReportSchema } from "@/lib/llm/schemas";
import type { LlmProvider } from "@/lib/llm/types";

function baseUrl() {
  return (process.env.NOUS_BASE_URL ?? "https://portal.nousresearch.com/v1").replace(/\/$/, "");
}

function modelId() {
  return process.env.NOUS_MODEL_ID ?? "nous-agent";
}

async function callNousAdapter(prompt: string) {
  const apiKey = process.env.NOUS_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`${baseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId(),
      messages: [
        { role: "system", content: "Return strict JSON only: {\"sections\":[{\"heading\":string,\"body\":string}]}" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 700
    })
  });

  if (!response.ok) throw new Error(`Nous adapter returned HTTP ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Nous adapter returned no assistant content.");
  return content;
}

function parseSections(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  const json = first >= 0 && last > first ? text.slice(first, last + 1) : text;
  return generatedReportSchema.parse(JSON.parse(json)).sections;
}

export const nousProvider: LlmProvider = {
  name: "nous",
  async complete(prompt: string, input?: ReportGenerationInput) {
    try {
      const text = await callNousAdapter(prompt);
      if (!text) return { sections: deterministicReportSections(input ?? {}), warning: "NOUS_API_KEY is not configured; deterministic fallback report content was used." };
      return { text, sections: parseSections(text) };
    } catch (error) {
      return {
        sections: deterministicReportSections(input ?? {}),
        warning: `Nous adapter failed; deterministic fallback report content was used: ${error instanceof Error ? error.message : "unknown error"}`
      };
    }
  }
};