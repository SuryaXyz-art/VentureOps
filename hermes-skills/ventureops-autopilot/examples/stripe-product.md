# Stripe Product Example

## Product

```yaml
name: "AI Web3 Founder Research Report"
price: 19
currency: "usd"
mode: "demo or stripe_test"
```

## Demo Mode

Demo mode is used when `STRIPE_SECRET_KEY` is absent.

Expected behavior:

```json
{
  "mode": "demo",
  "productId": "prod_demo_ai_web3_report",
  "priceId": "price_demo_1900",
  "checkoutUrl": "http://localhost:3000/success?demo=true"
}
```

No real Stripe API call is made. No real money moves.

## Stripe Test Mode

Stripe test mode is used when `STRIPE_SECRET_KEY` is present.

Required environment variables:

```bash
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Expected behavior:

1. Create Stripe product `AI Web3 Founder Research Report`.
2. Create Stripe price for `$19.00` USD.
3. Create Checkout Session.
4. Redirect founder/customer to Stripe Checkout.
5. Receive `checkout.session.completed` on `/api/stripe/webhook` when webhook forwarding is configured.
6. Store the Stripe event and customer order best-effort in SQLite.

## Alignment Notes

- Stripe Checkout for earning is implemented in test mode.
- Product/checkout/webhook code is separated so a future Stripe Projects provisioning layer can attach cleanly.
- Agent spend is not charged through live payment rails in this demo. Spend is modeled through policy-gated requests and receipts, making it Link / MPP-ready as a future integration pattern rather than a current live integration.
