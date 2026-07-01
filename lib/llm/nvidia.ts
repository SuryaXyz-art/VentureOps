import { deterministicReportSections, requiredReportSections } from "@/lib/fulfillment/templates";
import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import { generatedReportSchema } from "@/lib/llm/schemas";
import type { LlmProvider } from "@/lib/llm/types";

function baseUrl() {
  return (process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
}

function modelId() {
  return process.env.NEMOTRON_MODEL_ID ?? "nvidia/nemotron-3-ultra-550b-a55b";
}

async function callNvidiaAdapter(prompt: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = [
    "Return strict JSON only.",
    "Use exactly this shape: {\"sections\":[{\"heading\":string,\"body\":string}]}",
    "Do not use markdown fences.",
    "Do not add prose outside JSON.",
    `Include these section headings in order: ${requiredReportSections.join(", ")}.`
  ].join(" ");

  const response = await fetch(`${baseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "VentureOps Autopilot"
    },
    body: JSON.stringify({
      model: modelId(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1600
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`NVIDIA/OpenRouter adapter returned HTTP ${response.status}${body ? `: ${body.slice(0, 240)}` : ""}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("NVIDIA/OpenRouter adapter returned no assistant content.");
  return content;
}

function parseSections(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  const json = first >= 0 && last > first ? text.slice(first, last + 1) : text;
  return generatedReportSchema.parse(JSON.parse(json)).sections;
}

export const nvidiaProvider: LlmProvider = {
  name: "nvidia",
  async complete(prompt: string, input?: ReportGenerationInput) {
    try {
      const text = await callNvidiaAdapter(prompt);
      if (!text) return { sections: deterministicReportSections(input ?? {}), warning: "NVIDIA_API_KEY is not configured; deterministic fallback report content was used." };
      return { text, sections: parseSections(text) };
    } catch (error) {
      return {
        sections: deterministicReportSections(input ?? {}),
        warning: `NVIDIA/OpenRouter adapter failed; deterministic fallback report content was used: ${error instanceof Error ? error.message : "unknown error"}`
      };
    }
  }
};
