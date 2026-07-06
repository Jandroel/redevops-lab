import type {
  DevOpsScoreSummary,
  ExperienceLevel,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage
} from "@redevops-lab/shared";
import { localized, unique } from "./localization.js";

export interface GenerateRecommendedNextStepsInput {
  score: DevOpsScoreSummary;
  checklist: ProductionChecklistItem[];
  learningPath: LearningPathStep[];
  level: ExperienceLevel;
  language: ReportLanguage;
}

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1
} as const;

export function generateRecommendedNextSteps({
  score,
  checklist,
  learningPath,
  level,
  language
}: GenerateRecommendedNextStepsInput): string[] {
  const missingChecklist = checklist
    .filter((item) => item.status !== "done")
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority])
    .slice(0, 4)
    .map((item) =>
      localized(
        language,
        `Prioriza: ${item.title}. ${item.description}`,
        `Prioritize: ${item.title}. ${item.description}`
      )
    );
  const pathActions = learningPath
    .filter((step) => step.status === "recommended")
    .slice(0, 3)
    .map((step) =>
      localized(
        language,
        `Siguiente lab recomendado: ${step.title}.`,
        `Recommended next lab: ${step.title}.`
      )
    );
  const levelAction = localized(
    language,
    level === "advanced"
      ? "Convierte las mejoras en reglas repetibles para el equipo."
      : "Avanza en pasos pequenos y valida cada practica antes de sumar otra.",
    level === "advanced"
      ? "Turn improvements into repeatable rules for the team."
      : "Move in small steps and validate each practice before adding another."
  );
  const maturityAction = localized(
    language,
    `Score actual: ${score.percentage}%. Usa el checklist para cerrar las brechas mas visibles.`,
    `Current score: ${score.percentage}%. Use the checklist to close the most visible gaps.`
  );

  return unique([...missingChecklist, ...pathActions, maturityAction, levelAction]).slice(0, 5);
}
