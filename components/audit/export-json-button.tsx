"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportJsonButton({ json, filename = "ventureops-audit.json" }: { json: string; filename?: string }) {
  function exportJson() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <Button onClick={exportJson}><Download className="size-4" /> Export JSON</Button>;
}
