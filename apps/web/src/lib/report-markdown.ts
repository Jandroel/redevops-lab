import type { DevOpsReport } from "@redevops-lab/shared";

export function createReportMarkdown(report: DevOpsReport): string {
  const metadata = report.analysis?.repository ?? report.repository;
  const importantFiles = report.analysis?.importantFiles.length
    ? report.analysis.importantFiles.map((file) => `- ${file}`).join("\n")
    : "- Not available in this report.";
  const signals = report.analysis?.devopsSignals.length
    ? report.analysis.devopsSignals
        .map(
          (signal) =>
            `- ${signal.detected ? "Detected" : "Missing"}: ${signal.label} (${signal.category})`
        )
        .join("\n")
    : "- Not available in this report.";
  const categories = report.score.categories.map(formatCategory).join("\n\n");
  const strengths = report.score.strengths.map((item) => `- ${item}`).join("\n") || "- None detected yet.";
  const weaknesses =
    report.score.weaknesses.map((item) => `- ${item}`).join("\n") || "- None detected yet.";
  const nextBestActions =
    report.score.nextBestActions.map((item, index) => `${index + 1}. ${item}`).join("\n") ||
    "1. Keep improving DevOps evidence incrementally.";
  const findings = report.findings
    .map((finding) => `- **${finding.type}**: ${finding.title} - ${finding.description}`)
    .join("\n");
  const learningPath = report.learningPath
    .map((step, index) => `${index + 1}. ${step.title}: ${step.description}`)
    .join("\n");
  const labs = report.labs
    .map((lab) => `- ${lab.title} (${lab.difficulty}): ${lab.objective}`)
    .join("\n");

  return `# ReDevOps Lab Report

Repository: ${report.repository.fullName}

URL: ${report.repository.url}

Generated at: ${report.generatedAt}

## Repository Metadata

Stars: ${metadata.stars ?? "unknown"}

Forks: ${metadata.forks ?? "unknown"}

Default branch: ${metadata.defaultBranch ?? "unknown"}

Last pushed: ${metadata.pushedAt ?? "unknown"}

## Important Files

${importantFiles}

## DevOps Signals

${signals}

## DevOps Score

Total: ${report.score.total}/${report.score.maxScore}

Percentage: ${report.score.percentage}%

Maturity: ${report.score.maturityLevel}

## Category Breakdown

${categories}

## Strengths

${strengths}

## Weaknesses

${weaknesses}

## Next Best Actions

${nextBestActions}

## Findings

${findings}

## Learning Path

${learningPath}

## Hands-on Labs

${labs}
`;
}

function formatCategory(category: DevOpsReport["score"]["categories"][number]): string {
  const passed = category.rules
    .filter((rule) => rule.passed)
    .map((rule) => `- ${rule.title} (+${rule.points}/${rule.maxPoints})${formatEvidence(rule.evidence)}`)
    .join("\n");
  const missing = category.rules
    .filter((rule) => !rule.passed)
    .map((rule) => `- ${rule.title} (+0/${rule.maxPoints}) - ${rule.recommendation ?? "No recommendation."}`)
    .join("\n");

  return `### ${category.name} — ${category.score}/${category.maxScore} (${category.percentage}%)

${category.summary}

Passed:
${passed || "- None"}

Missing:
${missing || "- None"}`;
}

function formatEvidence(evidence: string[]): string {
  return evidence.length ? ` — evidence: ${evidence.join(", ")}` : "";
}
