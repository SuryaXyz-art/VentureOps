"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route | string; label: string }> = [
  { href: "/judge-demo", label: "Demo" },
  { href: "/operations", label: "Operations" },
  { href: "/agents", label: "Agents" },
  { href: "/stripe-revenue", label: "Revenue" },
  { href: "/orders", label: "Orders" },
  { href: "/profit-loss", label: "P&L" },
  { href: "/audit", label: "Audit" },
  { href: "/budget-firewall", label: "Firewall" },
  { href: "/approvals", label: "Approvals" },
  { href: "/submission", label: "Submission" },
  { href: "/submission-live", label: "Live Proof" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="container sticky top-0 z-40 flex flex-col gap-4 border-b border-white/10 bg-background/72 py-4 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow"><WalletCards className="size-5" /></div>
        <div><p className="text-xs text-muted-foreground">Agentic Business Control Tower</p><p className="font-semibold">VentureOps Autopilot</p></div>
      </Link>
      <nav className="flex flex-nowrap items-center gap-1 overflow-x-auto pb-1 xl:pb-0">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Button key={item.href} asChild variant="ghost" size="sm" className={cn("shrink-0 border border-transparent", active && "border-primary/35 bg-primary/12 text-primary shadow-glow")}>
              <Link href={item.href as Route}>{item.label}</Link>
            </Button>
          );
        })}
      </nav>
      <Badge className="hidden 2xl:inline-flex">Runtime monitored</Badge>
    </header>
  );
}