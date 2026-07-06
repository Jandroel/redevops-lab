"use client";

import { useEffect, useState } from "react";
import type { DevOpsReport } from "@redevops-lab/shared";
import { AnalysisProgress } from "@/components/analyze/analysis-progress";
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
        <div className="w-full max-w-3xl rounded-lg border border-devops-border bg-devops-surface/80 p-6 panel-edge">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-devops-blue">
            Loading report
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Checking local and API report data.</h1>
          <p className="mt-2 text-sm leading-6 text-devops-muted">
            ReDevOps Lab first looks for the session report created by the analyzer, then asks the
            API for a persisted or demo report.
          </p>
          <div className="mt-5">
            <AnalysisProgress activeStep={2} compact />
          </div>
        </div>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="grid min-h-[calc(100svh-8rem)] place-items-center bg-devops-bg px-4">
        <div className="max-w-lg rounded-lg border border-devops-border bg-devops-surface/80 p-6 panel-edge">
          <h1 className="text-2xl font-semibold text-white">Report unavailable</h1>
          <p className="mt-3 leading-7 text-devops-muted">
            {message || "No report was found in this browser session and the API did not return one."}
          </p>
          <p className="mt-3 text-sm leading-6 text-devops-muted">
            You can run a new analysis, inspect the demo report, or return home.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/analyze">Back to analyzer</ButtonLink>
            <ButtonLink href="/report/demo" variant="secondary">
              View demo report
            </ButtonLink>
            <ButtonLink href="/" variant="ghost">
              Home
            </ButtonLink>
          </div>
        </div>
      </section>
    );
  }

  return <ReportDashboard report={report} sourceLabel={sourceLabel} />;
}
