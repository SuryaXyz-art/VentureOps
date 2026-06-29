import {
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Calculator,
  GraduationCap,
  Megaphone,
  ReceiptText,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { AgentRole } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

const icons = {
  CEO: BriefcaseBusiness,
  CFO: Calculator,
  Growth: Megaphone,
  Stripe: Sparkles,
  Ops: Bot,
  Risk: ShieldCheck,
  Spend: ShieldCheck,
  Audit: ReceiptText,
  Learning: BrainCircuit,
  System: GraduationCap
};

export function AgentAvatar({
  role,
  className
}: {
  role: AgentRole;
  className?: string;
}) {
  const Icon = icons[role] ?? GraduationCap;

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary shadow-[0_0_26px_rgba(47,210,184,0.16)]",
        className
      )}
      title={`${role} Agent`}
    >
      <Icon className="size-5" />
    </div>
  );
}

