import type {
  DevOpsLab,
  DevOpsReport,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage
} from "@redevops-lab/shared";

export function createReportMarkdown(report: DevOpsReport): string {
  const language = report.input.language;
  const metadata = report.analysis?.repository ?? report.repository;
  const categories = report.score.categories ?? [];
  const strengthsList = report.score.strengths ?? [];
  const weaknessesList = report.score.weaknesses ?? [];
  const nextBestActionsList = report.score.nextBestActions ?? [];
  const findingsList = report.findings ?? [];
  const productionChecklist = report.productionChecklist ?? [];
  const learningPathSteps = report.learningPath ?? [];
  const handsOnLabs = report.labs ?? [];
  const importantFiles = report.analysis?.importantFiles.length
    ? report.analysis.importantFiles.map((file) => `- ${file}`).join("\n")
    : `- ${label(language, "No disponible en este reporte.", "Not available in this report.")}`;
  const signals = report.analysis?.devopsSignals.length
    ? report.analysis.devopsSignals
        .map(
          (signal) =>
            `- ${signal.detected ? label(language, "Detectado", "Detected") : label(language, "Sin senal", "Missing")}: ${signal.label} (${signal.category})`
        )
        .join("\n")
    : `- ${label(language, "No disponible en este reporte.", "Not available in this report.")}`;
  const categoryLines = categories.map((category) => formatCategory(category, language)).join("\n\n");
  const strengths =
    strengthsList.map((item) => `- ${item}`).join("\n") ||
    `- ${label(language, "Aun no se detectaron.", "None detected yet.")}`;
  const weaknesses =
    weaknessesList.map((item) => `- ${item}`).join("\n") ||
    `- ${label(language, "Aun no se detectaron.", "None detected yet.")}`;
  const nextBestActions =
    nextBestActionsList.map((item, index) => `${index + 1}. ${item}`).join("\n") ||
    `1. ${label(language, "Sigue mejorando la evidencia DevOps de forma incremental.", "Keep improving DevOps evidence incrementally.")}`;
  const findingLines = findingsList
    .map((finding) => `- **${finding.type}**: ${finding.title} - ${finding.description}`)
    .join("\n");
  const checklistLines = formatProductionChecklist(productionChecklist, language);
  const pathLines = formatLearningPath(learningPathSteps, language);
  const labLines = formatLabs(handsOnLabs, language);

  return `# ReDevOps Lab Report

Repository: ${report.repository.fullName}

URL: ${report.repository.url}

Generated at: ${report.generatedAt}

## ${label(language, "Metadatos del repositorio", "Repository Metadata")}

Stars: ${metadata.stars ?? "unknown"}

Forks: ${metadata.forks ?? "unknown"}

Default branch: ${metadata.defaultBranch ?? "unknown"}

Last pushed: ${metadata.pushedAt ?? "unknown"}

## ${label(language, "Archivos importantes", "Important Files")}

${importantFiles}

## DevOps Signals

${signals}

## DevOps Score

Total: ${report.score.total}/${report.score.maxScore}

Percentage: ${report.score.percentage}%

Maturity: ${report.score.maturityLevel}

## ${label(language, "Detalle por categoria", "Category Breakdown")}

${categoryLines}

## Strengths

${strengths}

## Weaknesses

${weaknesses}

## ${label(language, "Recommended Next Steps", "Recommended Next Steps")}

${nextBestActions}

## Findings

${findingLines}

## Production-ready Checklist

${checklistLines}

## Learning Path

${pathLines}

## Hands-on Labs

${labLines}
`;
}

function formatCategory(category: DevOpsReport["score"]["categories"][number], language: ReportLanguage): string {
  const rules = category.rules ?? [];
  const passed = rules
    .filter((rule) => rule.passed)
    .map((rule) => `- ${rule.title} (+${rule.points}/${rule.maxPoints})${formatEvidence(rule.evidence)}`)
    .join("\n");
  const missing = rules
    .filter((rule) => !rule.passed)
    .map((rule) => `- ${rule.title} (+0/${rule.maxPoints}) - ${rule.recommendation ?? label(language, "Sin recomendacion.", "No recommendation.")}`)
    .join("\n");

  return `### ${category.name} - ${category.score}/${category.maxScore} (${category.percentage}%)

${category.summary}

${label(language, "Detectado:", "Passed:")}
${passed || "- None"}

${label(language, "Sin senal detectada:", "Missing:")}
${missing || "- None"}`;
}

function formatProductionChecklist(items: ProductionChecklistItem[], language: ReportLanguage): string {
  if (!items.length) {
    return `- ${label(language, "No hay checklist disponible.", "No checklist available.")}`;
  }

  return items
    .map((item) => {
      const marker = item.status === "done" ? "[x]" : "[ ]";

      return `- ${marker} **${item.title}** (${item.category}, ${item.priority}, ${item.status}): ${item.description}${formatEvidence(item.evidence)}`;
    })
    .join("\n");
}

function formatLearningPath(steps: LearningPathStep[], language: ReportLanguage): string {
  if (!steps.length) {
    return `1. ${label(language, "No hay ruta disponible.", "No learning path available.")}`;
  }

  return steps
    .map(
      (step) => `${step.order}. **${step.title}** (${step.status ?? "recommended"}, ${step.difficulty ?? "beginner"})
${step.description}
${label(language, "Temas", "Topics")}: ${(step.topics ?? []).join(", ")}
${label(language, "Archivos relacionados", "Related files")}: ${(step.relatedFiles ?? []).join(", ") || "n/a"}
${label(language, "Labs", "Labs")}: ${(step.labs ?? []).join(", ") || "n/a"}`
    )
    .join("\n\n");
}

function formatLabs(labs: DevOpsLab[], language: ReportLanguage): string {
  if (!labs.length) {
    return `- ${label(language, "No hay labs disponibles.", "No labs available.")}`;
  }

  return labs
    .map(
      (lab, index) => `### Lab ${index + 1}: ${lab.title}

${label(language, "Dificultad", "Difficulty")}: ${lab.difficulty}

${label(language, "Categoria", "Category")}: ${lab.category ?? "general"}

${label(language, "Tiempo estimado", "Estimated time")}: ${lab.estimatedTime ?? "n/a"}

${label(language, "Objetivo", "Objective")}: ${lab.objective}

${label(language, "Por que importa", "Why it matters")}: ${lab.whyItMatters}

${label(language, "Archivos sugeridos", "Suggested files")}:
${(lab.suggestedFiles ?? []).map((file) => `- ${file}`).join("\n")}

${label(language, "Pasos", "Steps")}:
${(lab.steps ?? []).map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join("\n")}

${label(language, "Validacion", "Validation")}: ${lab.validation}`
    )
    .join("\n\n");
}

function formatEvidence(evidence: string[] = []): string {
  return evidence.length ? ` - evidence: ${evidence.join(", ")}` : "";
}

function label(language: ReportLanguage, es: string, en: string): string {
  return language === "es" ? es : en;
}
