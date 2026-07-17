import type {
  DevOpsConcept,
  DevOpsLab,
  DevOpsLearningModule,
  ExperienceLevel,
  GuidedLearningMission,
  LearningKnowledgeCheck,
  ProductionChecklistItem,
  ReportLanguage,
  RepositoryAnalysis
} from "@redevops-lab/shared";
import { localized, unique } from "./localization.js";

export interface GenerateGuidedLearningMissionsInput {
  analysis: RepositoryAnalysis;
  checklist: ProductionChecklistItem[];
  modules: DevOpsLearningModule[];
  labs: DevOpsLab[];
  concepts: DevOpsConcept[];
  level: ExperienceLevel;
  language: ReportLanguage;
}

export function generateGuidedLearningMissions({
  analysis,
  checklist,
  modules,
  labs,
  concepts,
  level,
  language
}: GenerateGuidedLearningMissionsInput): GuidedLearningMission[] {
  const checklistById = new Map(checklist.map((item) => [item.id, item]));
  const labsById = new Map(labs.map((lab) => [lab.id, lab]));
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const limit = level === "beginner" ? 4 : level === "intermediate" ? 5 : 6;

  const rankedModules = modules
    .filter((module) => module.category !== "general")
    .map((module, index) => ({
      module,
      index,
      score: missionPriority(module, checklistById, labsById)
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .sort(
      (left, right) =>
        learningOrder(left.module.category) - learningOrder(right.module.category) ||
        right.score - left.score
    );

  return rankedModules.map(({ module }, index) => {
    const relatedChecklist = module.checklistItems
      .map((id) => checklistById.get(id))
      .filter((item): item is ProductionChecklistItem => Boolean(item));
    const lab = module.labs
      .map((id) => labsById.get(id))
      .find((item): item is DevOpsLab => Boolean(item));
    const evidence = relatedChecklist.map((item) => ({
      id: item.id,
      label: item.title,
      detail: item.description,
      level:
        item.status === "done"
          ? ("confirmed" as const)
          : item.status === "missing"
            ? ("inferred" as const)
            : ("needs-review" as const),
      files: visibleEvidence(item.evidence)
    }));
    const evidenceLevel = resolveEvidenceLevel(
      analysis,
      evidence.map((item) => item.level)
    );
    const labSteps = lab?.steps?.slice(0, 4) ?? [];
    const steps = (labSteps.length ? labSteps : fallbackSteps(module, language)).map(
      (instruction, stepIndex) => ({
        id: `${module.id}-step-${stepIndex + 1}`,
        title: stepTitle(stepIndex, language),
        instruction
      })
    );

    return {
      id: `mission-${module.id.replace(/^module-/, "")}`,
      order: index + 1,
      title: module.title,
      category: module.category,
      summary: module.summary,
      plainLanguageGoal: module.beginnerGoal,
      whyNow: module.whyNow,
      estimatedTime: module.estimatedTime,
      evidenceLevel,
      evidenceReason: evidenceReason(evidenceLevel, analysis, language),
      evidence:
        evidence.length > 0
          ? evidence
          : [
              {
                id: `${module.id}-manual-review`,
                label: localized(language, "Requiere una revision manual", "Needs manual review"),
                detail: localized(
                  language,
                  "El arbol de archivos no basta para confirmar esta practica.",
                  "The file tree is not enough to confirm this practice."
                ),
                level: "needs-review",
                files: []
              }
            ],
      conceptIds: module.concepts.filter((id) => conceptIds.has(id)),
      labId: lab?.id,
      prerequisites: lab?.prerequisites ?? [],
      suggestedFiles: lab?.suggestedFiles ?? [],
      commands: lab?.commands ?? [],
      steps,
      expectedOutcome: lab?.expectedOutcome ?? module.outcome,
      completionCriteria: unique(
        lab?.completionCriteria?.length
          ? lab.completionCriteria
          : [lab?.validation ?? module.outcome]
      ),
      knowledgeCheck: knowledgeCheck(module.category, language),
      completionMessage: localized(
        language,
        `Ya puedes explicar ${module.title.toLowerCase()} con evidencia del repositorio.`,
        `You can now explain ${module.title.toLowerCase()} using repository evidence.`
      )
    };
  });
}

function learningOrder(category: DevOpsLearningModule["category"]): number {
  const order: Record<DevOpsLearningModule["category"], number> = {
    general: 0,
    configuration: 1,
    containerization: 2,
    ci_cd: 3,
    security: 4,
    observability: 5,
    documentation: 6,
    infrastructure: 7
  };

  return order[category];
}

function missionPriority(
  module: DevOpsLearningModule,
  checklistById: Map<string, ProductionChecklistItem>,
  labsById: Map<string, DevOpsLab>
): number {
  const checklistScore = module.checklistItems.reduce((total, id) => {
    const item = checklistById.get(id);

    if (!item) {
      return total;
    }

    const statusWeight = item.status === "missing" ? 3 : item.status === "recommended" ? 2 : 0.25;
    const priorityWeight = item.priority === "high" ? 4 : item.priority === "medium" ? 2 : 1;
    return total + statusWeight * priorityWeight;
  }, 0);
  const hasLab = module.labs.some((id) => labsById.has(id));

  return checklistScore + (hasLab ? 2 : 0);
}

function visibleEvidence(evidence: readonly string[]): string[] {
  return evidence.filter(
    (item) =>
      !/^No se detecto/i.test(item) &&
      !/^No visible signal/i.test(item) &&
      !/^No signal/i.test(item)
  );
}

function resolveEvidenceLevel(
  analysis: RepositoryAnalysis,
  levels: GuidedLearningMission["evidence"][number]["level"][]
): GuidedLearningMission["evidenceLevel"] {
  if (analysis.treeStats?.truncated || (analysis.warnings?.length ?? 0) > 0) {
    return "needs-review";
  }

  if (levels.includes("inferred")) {
    return "inferred";
  }

  if (levels.includes("needs-review") || levels.length === 0) {
    return "needs-review";
  }

  return "confirmed";
}

function evidenceReason(
  level: GuidedLearningMission["evidenceLevel"],
  analysis: RepositoryAnalysis,
  language: ReportLanguage
): string {
  if (analysis.treeStats?.truncated) {
    return localized(
      language,
      "GitHub entrego un arbol parcial. Toma esta mision como una guia y revisa el repositorio antes de cambiarlo.",
      "GitHub returned a partial tree. Treat this mission as guidance and review the repository before changing it."
    );
  }

  if ((analysis.warnings?.length ?? 0) > 0) {
    return localized(
      language,
      "El analisis incluye advertencias, por lo que esta practica necesita confirmacion manual.",
      "The analysis includes warnings, so this practice needs manual confirmation."
    );
  }

  if (level === "confirmed") {
    return localized(
      language,
      "Se encontraron archivos visibles que respaldan esta conclusion.",
      "Visible files were found that support this conclusion."
    );
  }

  if (level === "inferred") {
    return localized(
      language,
      "No se encontro una senal visible. Eso orienta la mision, pero no demuestra que la practica no exista.",
      "No visible signal was found. That guides the mission, but it does not prove the practice is absent."
    );
  }

  return localized(
    language,
    "La estructura del repositorio no basta para evaluar esta practica; revisala manualmente.",
    "The repository structure is not enough to assess this practice; review it manually."
  );
}

function fallbackSteps(module: DevOpsLearningModule, language: ReportLanguage): string[] {
  return [
    localized(
      language,
      `Revisa la evidencia relacionada con ${module.title.toLowerCase()}.`,
      `Review the evidence related to ${module.title.toLowerCase()}.`
    ),
    localized(
      language,
      "Haz un cambio pequeno en una rama y escribe que problema resuelve.",
      "Make one small change in a branch and write down the problem it solves."
    ),
    localized(
      language,
      "Ejecuta una validacion y guarda el resultado antes de continuar.",
      "Run a validation and keep the result before continuing."
    )
  ];
}

function stepTitle(index: number, language: ReportLanguage): string {
  const titles = [
    { es: "Entiende el punto de partida", en: "Understand the starting point" },
    { es: "Haz el cambio mas pequeno", en: "Make the smallest change" },
    { es: "Comprueba el resultado", en: "Check the result" },
    { es: "Deja evidencia para otra persona", en: "Leave evidence for someone else" }
  ];
  const title = titles[index] ?? titles.at(-1)!;

  return title[language];
}

function knowledgeCheck(
  category: DevOpsLearningModule["category"],
  language: ReportLanguage
): LearningKnowledgeCheck {
  const checks: Record<DevOpsLearningModule["category"], LearningKnowledgeCheck> = {
    general: buildCheck(
      language,
      "Que representa un hallazgo de ReDevOps Lab?",
      "What does a ReDevOps Lab finding represent?",
      [
        [
          "Una senal visible que debe interpretarse con contexto",
          "A visible signal that needs context",
          true
        ],
        ["Una auditoria definitiva de produccion", "A definitive production audit", false],
        [
          "Una garantia de que el repositorio es seguro",
          "A guarantee that the repository is secure",
          false
        ]
      ],
      "El reporte orienta con evidencia visible; no sustituye una auditoria ni una revision humana.",
      "The report guides you with visible evidence; it does not replace an audit or human review."
    ),
    configuration: buildCheck(
      language,
      "Que debe contener .env.example?",
      "What should .env.example contain?",
      [
        ["Nombres y valores falsos o seguros", "Names and fake or safe values", true],
        ["Tokens reales para ahorrar tiempo", "Real tokens to save time", false],
        ["Solo comentarios sin nombres de variables", "Only comments without variable names", false]
      ],
      ".env.example documenta el contrato de configuracion sin publicar secretos.",
      ".env.example documents the configuration contract without publishing secrets."
    ),
    containerization: buildCheck(
      language,
      "Que describe principalmente un Dockerfile?",
      "What does a Dockerfile primarily describe?",
      [
        ["Como construir una imagen reproducible", "How to build a reproducible image", true],
        ["Que contenedores estan ejecutandose ahora", "Which containers are running now", false],
        ["La lista de usuarios de GitHub", "The list of GitHub users", false]
      ],
      "El Dockerfile es la receta de construccion; Compose coordina servicios en ejecucion.",
      "A Dockerfile is the build recipe; Compose coordinates running services."
    ),
    ci_cd: buildCheck(
      language,
      "Por que ejecutar CI antes de hacer merge?",
      "Why run CI before merging?",
      [
        [
          "Para aplicar las mismas validaciones a cada cambio",
          "To apply the same checks to every change",
          true
        ],
        ["Para evitar escribir tests", "To avoid writing tests", false],
        ["Para reemplazar la revision de codigo", "To replace code review", false]
      ],
      "CI automatiza reglas compartidas, pero sigue necesitando buenos tests y revision humana.",
      "CI automates shared rules, but it still needs good tests and human review."
    ),
    security: buildCheck(
      language,
      "Que aporta un escaneo de seguridad automatico?",
      "What does automated security scanning provide?",
      [
        ["Una alerta temprana sobre riesgos conocidos", "An early warning about known risks", true],
        ["La garantia de cero vulnerabilidades", "A guarantee of zero vulnerabilities", false],
        ["Permiso para publicar secretos", "Permission to publish secrets", false]
      ],
      "El escaneo reduce riesgo y acelera hallazgos, pero no garantiza seguridad total.",
      "Scanning reduces risk and speeds up findings, but it does not guarantee total security."
    ),
    observability: buildCheck(
      language,
      "Que te dice un health check?",
      "What does a health check tell you?",
      [
        [
          "Si el servicio puede responder a una comprobacion basica",
          "Whether the service can answer a basic check",
          true
        ],
        ["La causa exacta de cualquier error", "The exact cause of every error", false],
        ["Todo el rendimiento historico", "All historical performance", false]
      ],
      "El health check es una senal minima. Logs y metricas explican mejor que esta ocurriendo.",
      "A health check is a minimal signal. Logs and metrics better explain what is happening."
    ),
    documentation: buildCheck(
      language,
      "Para que sirve un runbook?",
      "What is a runbook for?",
      [
        [
          "Para repetir una operacion y responder a problemas",
          "To repeat an operation and respond to problems",
          true
        ],
        ["Para sustituir todo el codigo", "To replace all code", false],
        ["Para ocultar decisiones de despliegue", "To hide deployment decisions", false]
      ],
      "Un runbook convierte conocimiento operativo en pasos que otra persona puede seguir.",
      "A runbook turns operational knowledge into steps someone else can follow."
    ),
    infrastructure: buildCheck(
      language,
      "Cual es una ventaja de Infrastructure as Code?",
      "What is one benefit of Infrastructure as Code?",
      [
        [
          "Versionar y revisar cambios de infraestructura",
          "Versioning and reviewing infrastructure changes",
          true
        ],
        [
          "Eliminar la necesidad de validar cambios",
          "Removing the need to validate changes",
          false
        ],
        ["Guardar credenciales en el repositorio", "Storing credentials in the repository", false]
      ],
      "IaC hace los cambios repetibles y revisables, pero tambien necesita validacion y manejo seguro del estado.",
      "IaC makes changes repeatable and reviewable, but it also needs validation and safe state handling."
    )
  };

  return checks[category];
}

function buildCheck(
  language: ReportLanguage,
  questionEs: string,
  questionEn: string,
  options: Array<[string, string, boolean]>,
  explanationEs: string,
  explanationEn: string
): LearningKnowledgeCheck {
  return {
    question: localized(language, questionEs, questionEn),
    options: options.map(([labelEs, labelEn, correct], index) => ({
      id: `option-${index + 1}`,
      label: localized(language, labelEs, labelEn),
      correct,
      feedback: correct
        ? localized(language, "Correcto. Esa es la idea clave.", "Correct. That is the key idea.")
        : localized(
            language,
            "Casi. Revisa la explicacion y prueba otra vez.",
            "Not quite. Review the explanation and try again."
          )
    })),
    explanation: localized(language, explanationEs, explanationEn)
  };
}
