import Stripe from "stripe";
import { getRuntimeConfig, requireLiveConfig } from "@/lib/config/runtime";
import { getStripeClient } from "@/lib/stripe/client";

export const RESEARCH_REPORT_PRODUCT = {
  name: "AI Web3 Founder Research Report",
  description: "A concise AI-assisted research report for Web3 founders with market signals, competitor notes, and launch recommendations.",
  unitAmount: 1900,
  currency: "usd"
};

export interface StripeProductInput {
  productName?: string;
  amountCents?: number;
  currency?: string;
}

export interface StripeProductResult {
  mode: "stripe" | "demo";
  productId: string;
  priceId: string;
  name: string;
  unitAmount: number;
  currency: string;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function lookupKey(productName: string, amountCents: number, currency: string) {
  return `ventureops-${slugify(productName)}-${currency}-${amountCents}`;
}

async function findReusableProduct(stripe: Stripe, productName: string) {
  const escapedName = productName.replace(/'/g, "\\'");
  const products = await stripe.products.search({
    query: `active:'true' AND metadata['app']:'ventureops-autopilot' AND metadata['product_name']:'${escapedName}'`,
    limit: 1
  });
  return products.data[0] ?? null;
}

export async function createResearchReportProduct(input: StripeProductInput = {}): Promise<StripeProductResult> {
  const productName = input.productName ?? RESEARCH_REPORT_PRODUCT.name;
  const unitAmount = input.amountCents ?? RESEARCH_REPORT_PRODUCT.unitAmount;
  const currency = input.currency ?? RESEARCH_REPORT_PRODUCT.currency;
  const stripe = getStripeClient();

  if (!stripe) {
    const runtime = getRuntimeConfig();
    if (!runtime.demoMode) {
      requireLiveConfig("stripe");
    }
    return {
      mode: "demo",
      productId: "prod_demo_ai_web3_report",
      priceId: "price_demo_1900",
      name: productName,
      unitAmount,
      currency
    };
  }

  const key = lookupKey(productName, unitAmount, currency);
  const reusablePrices = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  const existingPrice = reusablePrices.data[0];
  if (existingPrice && typeof existingPrice.product === "string") {
    const product = await stripe.products.retrieve(existingPrice.product);
    return {
      mode: "stripe",
      productId: product.id,
      priceId: existingPrice.id,
      name: "name" in product ? product.name : productName,
      unitAmount,
      currency
    };
  }

  const product = await findReusableProduct(stripe, productName) ?? await stripe.products.create({
    name: productName,
    description: RESEARCH_REPORT_PRODUCT.description,
    metadata: {
      app: "ventureops-autopilot",
      product_name: productName
    }
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency,
    lookup_key: key,
    metadata: {
      app: "ventureops-autopilot",
      product_name: productName,
      amount_cents: String(unitAmount)
    }
  });

  return {
    mode: "stripe",
    productId: product.id,
    priceId: price.id,
    name: product.name,
    unitAmount,
    currency
  };
}
