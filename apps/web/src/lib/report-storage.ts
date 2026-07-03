import type { DevOpsReport } from "@redevops-lab/shared";

const storagePrefix = "redevops-report:";

export function saveReportToSession(report: DevOpsReport): void {
  sessionStorage.setItem(`${storagePrefix}${report.id}`, JSON.stringify(report));
  sessionStorage.setItem("redevops-last-report-id", report.id);
}

export function getReportFromSession(id: string): DevOpsReport | null {
  const raw = sessionStorage.getItem(`${storagePrefix}${id}`);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DevOpsReport;
  } catch {
    sessionStorage.removeItem(`${storagePrefix}${id}`);
    return null;
  }
}
