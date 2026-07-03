"use client";

import { useEffect, useState } from "react";
import type { DevOpsReport } from "@redevops-lab/shared";
import { ButtonLink } from "@/components/ui/button";
import { getReport } from "@/lib/api";
import { getReportFromSession } from "@/lib/report-storage";
import { ReportDashboard } from "@/components/report/report-dashboard";

interface ReportPageClientProps {
  reportId: string;
}

export function ReportPageClient({ reportId }: ReportPageClientProps) {
  const [report, setReport] = useState<DevOpsReport | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [sourceLabel, setSourceLabel] = useState("Loading report");

  useEffect(() => {
    let isMounted = true;
    const cached = getReportFromSession(reportId);

    if (cached) {
      setReport(cached);
      setStatus("ready");
      setSourceLabel("Session report");
    }

    getReport(reportId)
      .then((apiReport) => {
        if (!isMounted) {
          return;
        }

        setReport(apiReport);
        setStatus("ready");
        setSourceLabel("API report");
      })
      .catch((error) => {
        if (!isMounted || cached) {
          return;
        }

        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Report not found.");
      });

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  if (status === "loading") {
    return (
      <section className="grid min-h-[calc(100svh-8rem)] place-items-center bg-devops-bg px-4">
        <div className="rounded-lg border border-devops-border bg-devops-surface/80 p-6 text-devops-muted panel-edge">
          Loading report...
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="grid min-h-[calc(100svh-8rem)] place-items-center bg-devops-bg px-4">
        <div className="max-w-lg rounded-lg border border-devops-border bg-devops-surface/80 p-6 panel-edge">
          <h1 className="text-2xl font-semibold text-white">Report unavailable</h1>
          <p className="mt-3 text-devops-muted">{message}</p>
          <div className="mt-6">
            <ButtonLink href="/analyze">Back to analyzer</ButtonLink>
          </div>
        </div>
      </section>
    );
  }

  return <ReportDashboard report={report} sourceLabel={sourceLabel} />;
}
