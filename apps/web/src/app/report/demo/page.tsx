import { ReportDashboard } from "@/components/report/report-dashboard";
import { getDemoReport } from "@/lib/api";
import { demoReport } from "@/lib/mock-report";

export const dynamic = "force-dynamic";

export default async function DemoReportPage() {
  const report = await getDemoReport().catch(() => demoReport);
  const sourceLabel = report === demoReport ? "Local fallback" : "API demo report";

  return <ReportDashboard report={report} sourceLabel={sourceLabel} />;
}
