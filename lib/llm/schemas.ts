import { z } from "zod";

const stringArray: z.ZodType<string[], z.ZodTypeDef, unknown> = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && !Array.isArray(value)) return Object.values(value).map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|;|\d+\.|- /)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
}, z.array(z.string().min(1)).min(1));

const exactlyThreeStrings: z.ZodType<string[], z.ZodTypeDef, unknown> = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && !Array.isArray(value)) return Object.values(value).map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|;|\d+\.|- /)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return value;
}, z.array(z.string().min(1)).min(3).max(3));

const positivePrice: z.ZodType<number, z.ZodTypeDef, unknown> = z.preprocess((value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 19;
}, z.number().positive());

export const businessPlanSchema = z.object({
  offerName: z.string().min(1),
  targetCustomer: z.string().min(1),
  priceRecommendation: positivePrice,
  operatingPlan: stringArray,
  successMetric: z.string().min(1)
});

export const growthPackageSchema = z.object({
  landingCopy: z.object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    cta: z.string().min(1)
  }),
  launchTweet: z.string().min(1),
  emailPitch: z.string().min(1),
  customerPersonas: exactlyThreeStrings
});

export const generatedReportSchema = z.object({
  title: z.string().min(1).optional(),
  sections: z.array(z.object({ heading: z.string().min(1), body: z.string().min(1) })).min(1)
});

export const learningRecommendationSchema = z.object({
  nextExperiment: z.string().min(1),
  pricingImprovement: z.string().min(1),
  riskImprovement: z.string().min(1)
});

export type BusinessPlanOutput = z.infer<typeof businessPlanSchema>;
export type GrowthPackageOutput = z.infer<typeof growthPackageSchema>;
export type GeneratedReportOutput = z.infer<typeof generatedReportSchema>;
export type LearningRecommendationOutput = z.infer<typeof learningRecommendationSchema>;