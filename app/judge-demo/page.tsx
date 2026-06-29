import { Suspense } from "react";
import { JudgeDemoPage } from "@/components/judge/judge-demo-page";

export default function JudgeDemoRoute() {
  return <Suspense fallback={null}><JudgeDemoPage /></Suspense>;
}
