import { z } from "zod";
import { isDemoMode } from "@/lib/config/runtime";
import { deterministicReportSections } from "@/lib/fulfillment/templates";
import type { ReportGenerationInput } from "@/lib/fulfillment/report-generator";
import type { LlmCompletionResult, LlmProvider } from "@/lib/llm/types";
import { generatedReportSchema } from "@/lib/llm/schemas";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type HermesOptions = {
  temperature?: number;
  max_tokens?: number;
  model?: string;
  timeoutMs?: number;
};

export type HermesTelemetry = {
  connected: boolean;
  lastError?: string;
  lastResponseId?: string;
  lastContentPreview?: string;
  checkedAt?: string;
};

const telemetry: HermesTelemetry = { connected: false };

export class HermesLlmError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "missing_api_key"
      | "connection_refused"
      | "timeout"
      | "non_200_response"
      | "invalid_response_body"
      | "schema_validation_failed"
  ) {
    super(message);
    this.name = "HermesLlmError";
  }
}

type HermesChatResponse = {
  id?: string;
  choices?: Array<{ message?: { content?: unknown } }>;
};

export function getHermesBaseUrl() {
  return (process.env.HERMES_BASE_URL ?? "http://127.0.0.1:8642/v1").replace(/\/$/, "");
}

export function getHermesModel() {
  return process.env.HERMES_MODEL ?? "hermes-agent";
}

export function getHermesTelemetry() {
  return { ...telemetry };
}

function setTelemetry(update: Partial<HermesTelemetry>) {
  Object.assign(telemetry, update, { checkedAt: new Date().toISOString() });
}

function isConnectionRefused(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = `${error.message} ${JSON.stringify((error as { cause?: unknown }).cause ?? "")}`.toLowerCase();
  return message.includes("econnrefused") || message.includes("connection refused") || message.includes("fetch failed");
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  if (fenced) return fenced;
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

export function parseHermesJson<T>(text: string, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(JSON.parse(extractJson(text)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid structured JSON";
    throw new HermesLlmError(`Hermes structured output validation failed: ${message}`, "schema_validation_failed");
  }
}

export async function callHermes(messages: ChatMessage[], options: HermesOptions = {}) {
  if (typeof window !== "undefined") {
    throw new HermesLlmError("Hermes calls are server-only and cannot run in client-side code.", "invalid_response_body");
  }

  const apiKey = process.env.HERMES_API_KEY;
  if (!apiKey) {
    const error = new HermesLlmError("HERMES_API_KEY is required for the Hermes provider.", "missing_api_key");
    setTelemetry({ connected: false, lastError: error.message });
    throw error;
  }

  const model = options.model ?? getHermesModel();
  const baseUrl = getHermesBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.max_tokens ?? 700
      })
    });
  } catch (error) {
    const hermesError = error instanceof DOMException && error.name === "AbortError"
      ? new HermesLlmError(`Hermes request timed out after ${options.timeoutMs ?? 30000}ms.`, "timeout")
      : isConnectionRefused(error)
        ? new HermesLlmError(`Unable to connect to Hermes at ${baseUrl}.`, "connection_refused")
        : error instanceof Error
          ? new HermesLlmError(`Hermes request failed: ${error.message}`, "connection_refused")
          : new HermesLlmError("Hermes request failed.", "connection_refused");
    setTelemetry({ connected: false, lastError: hermesError.message });
    throw hermesError;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new HermesLlmError(`Hermes returned HTTP ${response.status}${body ? `: ${body.slice(0, 300)}` : ""}`, "non_200_response");
    setTelemetry({ connected: false, lastError: error.message });
    throw error;
  }

  let data: HermesChatResponse;
  try {
    data = (await response.json()) as HermesChatResponse;
  } catch {
    const error = new HermesLlmError("Hermes returned invalid JSON.", "invalid_response_body");
    setTelemetry({ connected: false, lastError: error.message });
    throw error;
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    const error = new HermesLlmError("Hermes response did not include assistant message content.", "invalid_response_body");
    setTelemetry({ connected: false, lastError: error.message, lastResponseId: data.id });
    throw error;
  }

  setTelemetry({ connected: true, lastError: undefined, lastResponseId: data.id, lastContentPreview: content.slice(0, 220) });
  return content;
}

export async function callHermesStructured<T>(
  messages: ChatMessage[],
  schema: z.ZodSchema<T>,
  options: HermesOptions = {},
  retries = 1
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const text = await callHermes(messages, {
        ...options,
        temperature: attempt === 0 ? (options.temperature ?? 0.2) : 0,
        max_tokens: options.max_tokens ?? 600,
        timeoutMs: options.timeoutMs ?? 30000
      });
      return parseHermesJson(text, schema);
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
    }
  }

  throw lastError instanceof Error ? lastError : new HermesLlmError("Hermes structured call failed.", "schema_validation_failed");
}

function parseSections(text: string): LlmCompletionResult {
  const parsed = parseHermesJson(text, generatedReportSchema);
  return { text, sections: parsed.sections };
}

export const hermesProvider: LlmProvider = {
  name: "hermes",
  async complete(prompt: string, input?: ReportGenerationInput) {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You generate concise business reports. Return strict JSON only: {\"sections\":[{\"heading\":string,\"body\":string}]}. Do not include secrets."
      },
      { role: "user", content: prompt }
    ];

    try {
      const text = await callHermes(messages, { temperature: 0.2, max_tokens: 500, timeoutMs: 45000 });
      return parseSections(text);
    } catch (error) {
      const missingKey = error instanceof HermesLlmError && error.code === "missing_api_key";
      if (!isDemoMode() && missingKey) {
        throw error;
      }
      const warning = error instanceof HermesLlmError ? `Hermes provider failed (${error.code}); deterministic report sections were used.` : "Hermes provider failed; deterministic report sections were used.";
      return { sections: deterministicReportSections(input ?? {}), warning };
    }
  }
};


