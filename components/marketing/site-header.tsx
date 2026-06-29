import Link from "next/link";
import type { Route } from "next";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="container flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow"><WalletCards className="size-5" /></div>
        <div><p className="text-xs text-muted-foreground">Hermes Hackathon Build</p><p className="font-semibold">VentureOps Autopilot</p></div>
      </Link>
      <nav className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm"><Link href="/judge-demo">Judge Demo</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/operations">Operations</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/stripe-revenue">Revenue</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/orders">Orders</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/profit-loss">P&L</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/audit">Audit</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/budget-firewall">Firewall</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href={"/approvals" as Route}>Approvals</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href="/submission">Submission</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link href={"/submission-live" as Route}>Live Proof</Link></Button>
      </nav>
      <Badge className="hidden xl:inline-flex">Safe runtime online</Badge>
    </header>
  );
}





