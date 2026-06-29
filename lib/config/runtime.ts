import { hasStripeKeys } from "@/lib/stripe/client";

export type RuntimeMode = "demo" | "live_test";

export type RuntimeConfig = {
  demoMode: boolean;
  mode: RuntimeMode;
  appUrl: string;
  stripeConfigured: boolean;
  stripeWebhookConfigured: boolean;
  llmProvider: string;
  hermesConfigured: boolean;
  hermesBaseUrl: string;
  safeStatus: {
    demoMode: boolean;
    mode: RuntimeMode;
    appUrl: string;
    stripeConfigured: boolean;
    stripeWebhookConfigured: boolean;
    llmProvider: string;
    hermesConfigured: boolean;
    hermesBaseUrl: string;
  };
};

function envFlag(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function isDemoMode() {
  return envFlag(process.env.DEMO_MODE, true);
}

export function getRuntimeConfig(): RuntimeConfig {
  const demoMode = isDemoMode();
  const config = {
    demoMode,
    mode: demoMode ? "demo" as const : "live_test" as const,
    appUrl: process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    stripeConfigured: hasStripeKeys(),
    stripeWebhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    llmProvider: (process.env.LLM_PROVIDER ?? "mock").toLowerCase(),
    hermesConfigured: Boolean(process.env.HERMES_API_KEY),
    hermesBaseUrl: process.env.HERMES_BASE_URL ?? "http://127.0.0.1:8642/v1"
  };

  return {
    ...config,
    safeStatus: config
  };
}

export function requireLiveConfig(feature: "stripe" | "stripe_webhook" | "hermes" = "stripe") {
  const config = getRuntimeConfig();
  if (config.demoMode) return config;

  if (feature === "stripe" && !config.stripeConfigured) {
    throw new Error("Stripe test mode is not configured. Set STRIPE_SECRET_KEY or enable DEMO_MODE=true.");
  }

  if (feature === "stripe_webhook" && (!config.stripeConfigured || !config.stripeWebhookConfigured)) {
    throw new Error("Stripe webhook is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET or enable DEMO_MODE=true.");
  }

  if (feature === "hermes" && config.llmProvider === "hermes" && !config.hermesConfigured) {
    throw new Error("Hermes is selected but HERMES_API_KEY is not configured.");
  }

  return config;
}
