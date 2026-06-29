import { prisma } from "../lib/prisma";

async function main() {
  await prisma.demoRun.create({
    data: {
      goal: "Launch a paid AI research-report service for Web3 founders with a $25 operating budget.",
      budgetCents: 2500,
      revenueCents: 1900,
      costCents: 600,
      profitCents: 1300,
      blockedRiskCents: 6000,
      checkoutUrl: "/demo-checkout/web3-research-report",
      events: {
        create: [
          {
            role: "CEO",
            title: "Business plan generated",
            detail: "Seeded demo control tower run.",
            status: "complete"
          }
        ]
      },
      receipts: {
        create: [
          {
            source: "Demo Stripe Fallback",
            amountCents: 1900,
            decision: "recorded",
            note: "Seeded paid offer receipt."
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

