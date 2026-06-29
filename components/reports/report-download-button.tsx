"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportDownloadButton({ markdown, filename }: { markdown: string; filename: string }) {
  function download() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <Button onClick={download}><Download className="size-4" /> Download as Markdown</Button>;
}
