"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { operatingLoop } from "@/lib/demo/scenario";

export function OperatingLoopVisual() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-border/70 bg-card/70 p-5 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(47,210,184,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative grid h-full place-items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
          className="absolute size-64 rounded-full border border-primary/25"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          className="absolute size-80 rounded-full border border-accent/20"
        />
        <div className="relative z-10 grid w-full gap-3">
          {operatingLoop.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/58 p-3 backdrop-blur"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/12 text-xs font-semibold text-primary">
                {index + 1}
              </div>
              <p className="min-w-20 font-medium">{step}</p>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
              <ArrowRight className="size-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
