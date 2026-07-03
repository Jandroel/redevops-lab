"use client";

import { useState } from "react";
import type { DevOpsReport } from "@redevops-lab/shared";
import { Button } from "@/components/ui/button";
import { getReportMarkdown } from "@/lib/api";
import { createReportMarkdown } from "@/lib/report-markdown";

interface ExportMarkdownButtonProps {
  reportId: string;
  report: DevOpsReport;
}

export function ExportMarkdownButton({ reportId, report }: ExportMarkdownButtonProps) {
  const [label, setLabel] = useState("Export Markdown");

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        setLabel("Preparing...");
        let markdown: string;

        try {
          markdown = await getReportMarkdown(reportId);
        } catch {
          markdown = createReportMarkdown(report);
        }

        const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "redevops-report.md";
        anchor.click();
        URL.revokeObjectURL(url);
        setLabel("Exported");
        window.setTimeout(() => setLabel("Export Markdown"), 1200);
      }}
    >
      {label}
    </Button>
  );
}
