"use client";

import { useEffect, useState } from "react";

export function AnimatedMetric({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 28;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / total, 1);
      setDisplay(value * (1 - Math.pow(1 - progress, 3)));
      if (progress >= 1) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [value]);

  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}
