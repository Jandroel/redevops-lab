import { Injectable } from "@nestjs/common";
import type { AiReportEnhancement, ProductionChecklistItem, ReportLanguage } from "@redevops-lab/shared";
import type { AiEnhancementInput, AiProvider } from "./ai-provider.interface.js";

@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async enhanceReport(input: AiEnhancementInput): Promise<AiReportEnhancement> {
    const { report, mode, enabled } = input;
    const language = report.input.language;
    const missing = report.productionChecklist.filter((item) => item.status !== "done");
    const highPriority = missing.filter((item) => item.priority === "high");
    const focusItems = (highPriority.length ? highPriority : missing).slice(0, 3);
    const focus = formatChecklistFocus(focusItems, language);
    const maturity = report.score.maturityLevel;
    const score = `${report.score.percentage}%`;

    return {
      enabled,
      provider: "mock",
      mode,
      generatedAt: new Date().toISOString(),
      mentorSummary: enabled
        ? text(
            language,
            `Este mentor mock resume el reporte de ${report.repository.fullName} usando solo evidencia deterministica. El score actual es ${score} (${maturity}).`,
            `This mock mentor summarizes ${report.repository.fullName} using deterministic evidence only. The current score is ${score} (${maturity}).`
          )
        : text(
            language,
            "AI mentor is disabled. This report was generated using deterministic repository analysis.",
            "AI mentor is disabled. This report was generated using deterministic repository analysis."
          ),
      scoreInterpretation: text(
        language,
        `El score indica una madurez ${maturity}. Debe leerse como una guia educativa basada en senales visibles, no como auditoria formal.`,
        `The score indicates ${maturity} maturity. Read it as educational guidance based on visible signals, not as a formal audit.`
      ),
      recommendedFocus: focus,
      riskExplanation: createRiskExplanation(input),
      mentorNotes: [
        text(
          language,
          "Los hechos principales vienen del analyzer, scoring engine y learning engine.",
          "The main facts come from the analyzer, scoring engine, and learning engine."
        ),
        text(
          language,
          "Si una practica no aparece, tratala como falta de senal detectada, no como prueba absoluta de ausencia.",
          "If a practice does not appear, treat it as no detected signal, not absolute proof of absence."
        ),
        text(
          language,
          modeNote(mode).es,
          modeNote(mode).en
        )
      ],
      portfolioAdvice: [
        text(
          language,
          "Muestra el score, el checklist y los labs como evidencia de aprendizaje practico.",
          "Show the score, checklist, and labs as evidence of practical learning."
        ),
        text(
          language,
          "Convierte uno o dos labs en pull requests pequenos con explicacion clara.",
          "Turn one or two labs into small pull requests with clear explanations."
        )
      ],
      interviewTalkingPoints: [
        text(
          language,
          `Puedes explicar que el repo esta en nivel ${maturity} y que las prioridades salen de reglas deterministicas.`,
          `You can explain that the repo is at ${maturity} level and that priorities come from deterministic rules.`
        ),
        text(
          language,
          "Habla de tradeoffs: primero senales visibles y reproducibles, luego automatizacion mas avanzada.",
          "Talk about tradeoffs: visible and reproducible signals first, then deeper automation."
        )
      ],
      improvedNextSteps: report.score.nextBestActions.slice(0, 5),
      learningAdvice: report.learningPath.slice(0, 5).map((step) =>
        text(
          language,
          `Practica: ${step.title}. ${step.description}`,
          `Practice: ${step.title}. ${step.description}`
        )
      )
    };
  }
}

function createRiskExplanation(input: AiEnhancementInput): string {
  const highPriorityMissing = input.report.productionChecklist.filter(
    (item) => item.status !== "done" && item.priority === "high"
  );

  if (!highPriorityMissing.length) {
    return text(
      input.report.input.language,
      "No hay brechas high-priority visibles en el checklist, pero la revision sigue limitada a senales del repositorio.",
      "No high-priority visible checklist gaps were found, but the review is still limited to repository signals."
    );
  }

  return text(
    input.report.input.language,
    `Las brechas mas sensibles estan en: ${highPriorityMissing.map((item) => item.title).join(", ")}.`,
    `The most sensitive gaps are: ${highPriorityMissing.map((item) => item.title).join(", ")}.`
  );
}

function formatChecklistFocus(items: ProductionChecklistItem[], language: ReportLanguage): string {
  if (!items.length) {
    return text(
      language,
      "Mantener las practicas detectadas y avanzar con mejoras opcionales de produccion.",
      "Maintain the detected practices and move into optional production improvements."
    );
  }

  return text(
    language,
    `Enfocate primero en: ${items.map((item) => item.title).join(", ")}.`,
    `Focus first on: ${items.map((item) => item.title).join(", ")}.`
  );
}

function modeNote(mode: AiEnhancementInput["mode"]): { es: string; en: string } {
  const notes: Record<AiEnhancementInput["mode"], { es: string; en: string }> = {
    learning: {
      es: "Usa el reporte como ruta de aprendizaje, no solo como checklist.",
      en: "Use the report as a learning path, not just a checklist."
    },
    interview: {
      es: "Prepara respuestas sobre por que priorizaste esas mejoras.",
      en: "Prepare answers about why you prioritized those improvements."
    },
    production: {
      es: "Prioriza cambios que reduzcan riesgo operativo antes de optimizaciones.",
      en: "Prioritize changes that reduce operational risk before optimizations."
    },
    portfolio: {
      es: "Convierte mejoras pequenas en evidencia visible para tu portafolio.",
      en: "Turn small improvements into visible portfolio evidence."
    },
    "open-source": {
      es: "Haz que el repositorio sea mas claro para contribuciones externas.",
      en: "Make the repository clearer for external contributors."
    }
  };

  return notes[mode] ?? notes.learning;
}

function text(language: ReportLanguage, es: string, en: string): string {
  return language === "es" ? es : en;
}
