import { hermesProvider } from "@/lib/llm/hermes";
import { mockProvider } from "@/lib/llm/mock";
import { nousProvider } from "@/lib/llm/nous";
import { nvidiaProvider } from "@/lib/llm/nvidia";
import type { LlmProvider } from "@/lib/llm/types";

export function getLlmProvider(): LlmProvider {
  const provider = (process.env.LLM_PROVIDER ?? "mock").toLowerCase();

  if (provider === "mock") return mockProvider;
  if (provider === "hermes") return hermesProvider;
  if (provider === "nous") return nousProvider;
  if (provider === "nvidia") return nvidiaProvider;

  return mockProvider;
}
