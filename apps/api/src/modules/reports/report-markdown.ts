import type {
  AiReportEnhancement,
  DevOpsConcept,
  DevOpsLab,
  DevOpsLearningModule,
  DevOpsReport,
  GuidedLearningMission,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage,
  RepositoryContentAnalysis
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
  const learningModules = report.learningModules ?? [];
  const guidedMissions = report.guidedMissions ?? [];
  const concepts = report.concepts ?? [];
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
  const deepAnalysis = formatContentAnalysis(report.analysis?.contentAnalysis, language);
  const categoryLines = categories
    .map((category) => formatCategory(category, language))
    .join("\n\n");
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
  const moduleLines = formatLearningModules(learningModules, language);
  const missionLines = formatGuidedMissions(guidedMissions, language);
  const conceptLines = formatConcepts(concepts, language);
  const pathLines = formatLearningPath(learningPathSteps, language);
  const labLines = formatLabs(handsOnLabs, language);
  const aiMentorLines = formatAiMentor(report.ai, language);

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

## ${label(language, "Analisis profundo", "Deep Repository Analysis")}

${deepAnalysis}

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

## DevOps AI Mentor

${aiMentorLines}

## Production-ready Checklist

${checklistLines}

## ${label(language, "Misiones guiadas", "Guided Missions")}

${missionLines}

## ${label(language, "Ruta guiada para principiantes", "Beginner Learning Journey")}

${moduleLines}

## ${label(language, "Glosario practico", "Practical Glossary")}

${conceptLines}

## Learning Path

${pathLines}

## Hands-on Labs

${labLines}
`;
}

function formatGuidedMissions(missions: GuidedLearningMission[], language: ReportLanguage): string {
  if (!missions.length) {
    return `- ${label(language, "No hay misiones guiadas disponibles.", "No guided missions available.")}`;
  }

  return missions
    .map(
      (mission) => `### ${mission.order}. ${mission.title}

${mission.plainLanguageGoal}

${label(language, "Por que ahora", "Why now")}: ${mission.whyNow}

${label(language, "Nivel de evidencia", "Evidence level")}: ${mission.evidenceLevel}

${mission.evidenceReason}

${label(language, "Evidencia", "Evidence")}:
${mission.evidence
  .map(
    (item) =>
      `- **${item.label}** (${item.level}): ${item.detail}${item.files.length ? ` - ${item.files.join(", ")}` : ""}`
  )
  .join("\n")}

${label(language, "Pasos", "Steps")}:
${mission.steps.map((step, index) => `${index + 1}. **${step.title}**: ${step.instruction}`).join("\n")}

${label(language, "Comandos", "Commands")}:
${formatCodeList(mission.commands)}

${label(language, "Criterios de cierre", "Completion criteria")}:
${formatBulletList(mission.completionCriteria)}

${label(language, "Comprueba lo aprendido", "Knowledge check")}: ${mission.knowledgeCheck.question}

${mission.knowledgeCheck.explanation}`
    )
    .join("\n\n");
}

function formatContentAnalysis(
  analysis: RepositoryContentAnalysis | undefined,
  language: ReportLanguage
): string {
  if (!analysis) {
    return `- ${label(language, "No disponible en este reporte.", "Not available in this report.")}`;
  }

  const files =
    analysis.files.map((file) => `- ${file.path} (${file.kind})`).join("\n") || "- None";
  const checks =
    analysis.checks
      .map(
        (check) =>
          `- **${check.status}**: ${check.title}${check.evidence.length ? ` - ${check.evidence.join(", ")}` : ""}`
      )
      .join("\n") || "- None";

  return `${label(language, "Archivos inspeccionados", "Files inspected")}: ${analysis.stats.analyzedFiles}/${analysis.stats.selectedFiles}

${files}

${label(language, "Comprobaciones de contenido", "Content checks")}:
${checks}`;
}

function formatCategory(
  category: DevOpsReport["score"]["categories"][number],
  language: ReportLanguage
): string {
  const rules = category.rules ?? [];
  const passed = rules
    .filter((rule) => rule.passed)
    .map(
      (rule) =>
        `- ${rule.title} (+${rule.points}/${rule.maxPoints})${formatEvidence(rule.evidence)}`
    )
    .join("\n");
  const missing = rules
    .filter((rule) => !rule.passed)
    .map(
      (rule) =>
        `- ${rule.title} (+0/${rule.maxPoints}) - ${rule.recommendation ?? label(language, "Sin recomendacion.", "No recommendation.")}`
    )
    .join("\n");

  return `### ${category.name} - ${category.score}/${category.maxScore} (${category.percentage}%)

${category.summary}

${label(language, "Detectado:", "Passed:")}
${passed || "- None"}

${label(language, "Sin senal detectada:", "Missing:")}
${missing || "- None"}`;
}

function formatProductionChecklist(
  items: ProductionChecklistItem[],
  language: ReportLanguage
): string {
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

function formatLearningModules(modules: DevOpsLearningModule[], language: ReportLanguage): string {
  if (!modules.length) {
    return `- ${label(language, "No hay modulos guiados disponibles.", "No guided modules available.")}`;
  }

  return modules
    .map(
      (module, index) => `### ${index + 1}. ${module.title}

${module.summary}

${label(language, "Objetivo para principiantes", "Beginner goal")}: ${module.beginnerGoal}

${label(language, "Por que ahora", "Why now")}: ${module.whyNow}

${label(language, "Tiempo estimado", "Estimated time")}: ${module.estimatedTime}

${label(language, "Resultado esperado", "Expected outcome")}: ${module.outcome}

${label(language, "Conceptos", "Concepts")}: ${module.concepts.join(", ") || "n/a"}

${label(language, "Labs relacionados", "Related labs")}: ${module.labs.join(", ") || "n/a"}

${label(language, "Checklist relacionada", "Related checklist")}: ${module.checklistItems.join(", ") || "n/a"}`
    )
    .join("\n\n");
}

function formatConcepts(concepts: DevOpsConcept[], language: ReportLanguage): string {
  if (!concepts.length) {
    return `- ${label(language, "No hay conceptos disponibles.", "No concepts available.")}`;
  }

  return concepts
    .map(
      (concept) => `### ${concept.term}

${label(language, "Categoria", "Category")}: ${concept.category}

${concept.shortDefinition}

${label(language, "En palabras simples", "In plain words")}: ${concept.beginnerExplanation}

${label(language, "Por que importa", "Why it matters")}: ${concept.whyItMatters}

${label(language, "Ejemplo", "Example")}: ${concept.example}

${label(language, "Relacionados", "Related")}: ${concept.relatedTerms.join(", ") || "n/a"}`
    )
    .join("\n\n");
}

function formatLearningPath(steps: LearningPathStep[], language: ReportLanguage): string {
  if (!steps.length) {
    return `1. ${label(language, "No hay ruta disponible.", "No learning path available.")}`;
  }

  return steps
    .map(
      (
        step
      ) => `${step.order}. **${step.title}** (${step.status ?? "recommended"}, ${step.difficulty ?? "beginner"})
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

${label(language, "Conceptos", "Concepts")}: ${(lab.conceptIds ?? []).join(", ") || "n/a"}

${label(language, "Antes de empezar", "Before you start")}:
${formatBulletList(lab.prerequisites)}

${label(language, "Archivos sugeridos", "Suggested files")}:
${formatBulletList(lab.suggestedFiles)}

${label(language, "Pasos", "Steps")}:
${formatNumberedList(lab.steps)}

${label(language, "Comandos sugeridos", "Suggested commands")}:
${formatCodeList(lab.commands)}

${label(language, "Resultado esperado", "Expected outcome")}: ${lab.expectedOutcome ?? "n/a"}

${label(language, "Errores comunes", "Common mistakes")}:
${formatBulletList(lab.commonMistakes)}

${label(language, "Criterios de cierre", "Completion criteria")}:
${formatBulletList(lab.completionCriteria)}

${label(language, "Checklist de verificacion", "Verification checklist")}:
${formatBulletList(lab.verificationChecklist)}

${label(language, "Validacion", "Validation")}: ${lab.validation}`
    )
    .join("\n\n");
}

function formatAiMentor(ai: AiReportEnhancement | undefined, language: ReportLanguage): string {
  if (!ai || !ai.enabled) {
    return label(
      language,
      "AI mentor was disabled for this report. The analysis, score, checklist and labs were generated using deterministic rules.",
      "AI mentor was disabled for this report. The analysis, score, checklist and labs were generated using deterministic rules."
    );
  }

  return `AI is optional in ReDevOps Lab. Repository facts and scoring are generated by deterministic analysis.

Provider: ${ai.provider}${ai.model ? ` (${ai.model})` : ""}

Mode: ${ai.mode}

### Mentor Summary

${ai.mentorSummary}

### Score Interpretation

${ai.scoreInterpretation}

### Recommended Focus

${ai.recommendedFocus}

### Risk Explanation

${ai.riskExplanation}

### Mentor Notes

${formatList(ai.mentorNotes)}

### Portfolio Advice

${formatList(ai.portfolioAdvice)}

### Interview Talking Points

${formatList(ai.interviewTalkingPoints)}

### Learning Advice

${formatList(ai.learningAdvice)}

### Improved Next Steps

${formatList(ai.improvedNextSteps)}`;
}

function formatEvidence(evidence: string[] = []): string {
  return evidence.length ? ` - evidence: ${evidence.join(", ")}` : "";
}

function formatBulletList(items: readonly string[] = []): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- n/a";
}

function formatNumberedList(items: readonly string[] = []): string {
  return items.length ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. n/a";
}

function formatCodeList(items: readonly string[] = []): string {
  if (!items.length) {
    return "- n/a";
  }

  return items.map((item) => `\`\`\`bash\n${item}\n\`\`\``).join("\n\n");
}

function formatList(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function label(language: ReportLanguage, es: string, en: string): string {
  return language === "es" ? es : en;
}
