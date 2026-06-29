import { getStripeClient } from "@/lib/stripe/client";

export interface DemoOffer {
  productId: string;
  priceId: string;
  customerId: string;
  checkoutUrl: string;
  mode: "stripe" | "demo";
}

export async function createDemoOffer(): Promise<DemoOffer> {
  const stripe = getStripeClient();

  if (!stripe || process.env.DEMO_MODE === "true") {
    return {
      productId: "prod_demo_web3_report",
      priceId: "price_demo_1900",
      customerId: "cus_demo_founder",
      checkoutUrl: "/demo-checkout/web3-research-report",
      mode: "demo"
    };
  }

  const product = await stripe.products.create({
    name: "AI Web3 Founder Research Report",
    description: "AI-assisted market signal report for Web3 founders."
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 1900,
    currency: "usd"
  });

  const customer = await stripe.customers.create({
    email: "founder@example.com",
    name: "Demo Web3 Founder"
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }]
  });

  return {
    productId: product.id,
    priceId: price.id,
    customerId: customer.id,
    checkoutUrl: paymentLink.url,
    mode: "stripe"
  };
}

