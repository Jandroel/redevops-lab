import type { DevOpsFinding, RepositoryAnalysis } from "@redevops-lab/shared";

export function detectInitialFindings(analysis: RepositoryAnalysis): DevOpsFinding[] {
  const findings: DevOpsFinding[] = [];
  const signals = new Map(analysis.devopsSignals.map((signal) => [signal.key, signal]));

  if (signals.get("dockerfile")?.detected) {
    findings.push({
      type: "strength",
      title: "Dockerfile detected",
      description: "The repository includes a Dockerfile, which is a strong containerization signal.",
      severity: "low"
    });
  } else {
    findings.push({
      type: "missing",
      title: "No Dockerfile detected",
      description: "The project does not expose a clear container build path yet.",
      severity: "medium"
    });
  }

  if (signals.get("github_actions")?.detected || signals.get("external_ci")?.detected) {
    findings.push({
      type: "strength",
      title: "CI/CD configuration detected",
      description: "The repository includes at least one CI/CD workflow or pipeline configuration.",
      severity: "low"
    });
  } else {
    findings.push({
      type: "missing",
      title: "No CI/CD pipeline detected",
      description: "Add CI to validate install, lint, tests, typecheck, and build on every change.",
      severity: "high"
    });
  }

  if (signals.get("env_example")?.detected) {
    findings.push({
      type: "strength",
      title: "Environment example found",
      description: "The repository documents expected environment variables with an example file.",
      severity: "low"
    });
  } else {
    findings.push({
      type: "missing",
      title: "No environment example file found",
      description: "Add .env.example so contributors and deploy platforms know required variables.",
      severity: "medium"
    });
  }

  if (!signals.get("dependency_scanning")?.detected) {
    findings.push({
      type: "missing",
      title: "No dependency or security scanning detected",
      description: "Add Dependabot, CodeQL, Snyk, Trivy, Gitleaks, or Semgrep to catch risks earlier.",
      severity: "high"
    });
  }

  if (!signals.get("observability")?.detected) {
    findings.push({
      type: "risk",
      title: "Observability signals are missing",
      description: "No clear health, metrics, logging, tracing, Prometheus, or Grafana signal was found.",
      severity: "medium"
    });
  }

  if (signals.get("readme")?.detected) {
    findings.push({
      type: "strength",
      title: "README detected",
      description: "The repository has a README entry point for developers.",
      severity: "low"
    });
  }

  if (!signals.get("deployment_docs")?.detected) {
    findings.push({
      type: "risk",
      title: "Deployment process may be undocumented",
      description: "No deployment-focused documentation was detected.",
      severity: "medium"
    });
  }

  if (analysis.treeStats?.truncated) {
    findings.push({
      type: "risk",
      title: "Repository tree was truncated",
      description: "The repository is large, so only the first relevant files were analyzed.",
      severity: "medium"
    });
  }

  return findings.slice(0, 12);
}
