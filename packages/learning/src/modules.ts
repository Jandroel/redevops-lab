import type {
  DevOpsConcept,
  DevOpsLab,
  DevOpsLearningModule,
  ExperienceLevel,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage
} from "@redevops-lab/shared";
import { categoryLabel, localized, unique } from "./localization.js";

export interface GenerateLearningModulesInput {
  checklist: ProductionChecklistItem[];
  learningPath: LearningPathStep[];
  labs: DevOpsLab[];
  concepts: DevOpsConcept[];
  level: ExperienceLevel;
  language: ReportLanguage;
}

interface ModuleTemplate {
  id: string;
  category: DevOpsLearningModule["category"];
  conceptIds: string[];
  labIds: string[];
  checklistIds: string[];
  title: { es: string; en: string };
  summary: { es: string; en: string };
  beginnerGoal: { es: string; en: string };
  outcome: { es: string; en: string };
  estimatedTime: string;
}

export function generateLearningModules({
  checklist,
  learningPath,
  labs,
  concepts,
  level,
  language
}: GenerateLearningModulesInput): DevOpsLearningModule[] {
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const labIds = new Set(labs.map((lab) => lab.id));
  const checklistIds = new Set(checklist.map((item) => item.id));
  const pathLabIds = new Set(learningPath.flatMap((step) => step.labs ?? []));
  const relevantCategories = new Set(
    checklist
      .filter((item) => item.status !== "done" || item.priority === "high")
      .map((item) => item.category)
  );

  return moduleTemplates()
    .filter((template) => {
      if (template.category === "general") {
        return true;
      }

      const hasLab = template.labIds.some((id) => labIds.has(id) || pathLabIds.has(id));
      const hasChecklist = template.checklistIds.some((id) => checklistIds.has(id));
      const hasConcept = template.conceptIds.some((id) => conceptIds.has(id));

      return relevantCategories.has(template.category) || hasLab || hasChecklist || hasConcept;
    })
    .slice(0, level === "advanced" ? 8 : 7)
    .map((template) => {
      const moduleConcepts = template.conceptIds.filter((id) => conceptIds.has(id));
      const moduleLabs = template.labIds.filter((id) => labIds.has(id));
      const moduleChecklistItems = template.checklistIds.filter((id) => checklistIds.has(id));

      return {
        id: template.id,
        title: template.title[language],
        category: template.category,
        summary: template.summary[language],
        beginnerGoal: template.beginnerGoal[language],
        whyNow: whyNow(template.category, checklist, language),
        concepts: moduleConcepts.length ? moduleConcepts : template.conceptIds.slice(0, 2),
        labs: moduleLabs,
        checklistItems: moduleChecklistItems,
        estimatedTime: template.estimatedTime,
        outcome: template.outcome[language]
      };
    });
}

function whyNow(
  category: DevOpsLearningModule["category"],
  checklist: ProductionChecklistItem[],
  language: ReportLanguage
): string {
  if (category === "general") {
    return localized(
      language,
      "Empieza aqui para entender como leer el reporte y convertir hallazgos en acciones pequenas.",
      "Start here to understand how to read the report and turn findings into small actions."
    );
  }

  const related = checklist.filter((item) => item.category === category);
  const missing = related.filter((item) => item.status !== "done");
  const label = categoryLabel(category, language);

  if (missing.length) {
    return localized(
      language,
      `${label} tiene ${missing.length} practica(s) por reforzar en este repositorio.`,
      `${label} has ${missing.length} practice(s) to strengthen in this repository.`
    );
  }

  return localized(
    language,
    `${label} ya tiene senales, asi que este modulo ayuda a entenderlas y mantenerlas.`,
    `${label} already has signals, so this module helps you understand and maintain them.`
  );
}

function moduleTemplates(): ModuleTemplate[] {
  const runtimeChecklist = ["configuration.env_example", "configuration.docs"];
  const containerChecklist = [
    "containerization.dockerfile",
    "containerization.dockerignore",
    "containerization.compose"
  ];
  const ciChecklist = ["ci_cd.pipeline", "ci_cd.tests_build", "ci_cd.deploy"];
  const securityChecklist = ["security.dependabot", "security.scanning", "security.policy"];
  const observabilityChecklist = ["observability.health", "observability.logging_metrics"];
  const documentationChecklist = ["documentation.deployment", "documentation.docs"];
  const infrastructureChecklist = [
    "infrastructure.iac",
    "infrastructure.kubernetes",
    "infrastructure.deployment_config"
  ];

  const templates: ModuleTemplate[] = [
    {
      id: "module-devops-map",
      category: "general",
      conceptIds: ["devops-feedback-loop", "repository-signal"],
      labIds: [],
      checklistIds: [],
      title: { es: "Mapa mental DevOps", en: "DevOps mental model" },
      summary: {
        es: "Aprende a leer el reporte como un ciclo de evidencia, practica y mejora.",
        en: "Learn to read the report as a cycle of evidence, practice, and improvement."
      },
      beginnerGoal: {
        es: "Distinguir score, checklist, ruta, labs y evidencia sin memorizar herramientas.",
        en: "Distinguish score, checklist, path, labs, and evidence without memorizing tools."
      },
      outcome: {
        es: "Puedes explicar que detecto ReDevOps Lab y cual es el siguiente paso razonable.",
        en: "You can explain what ReDevOps Lab detected and the reasonable next step."
      },
      estimatedTime: "15-25 min"
    },
    {
      id: "module-runtime-config",
      category: "configuration",
      conceptIds: ["environment-variable", "secret-hygiene"],
      labIds: ["lab-env-example"],
      checklistIds: runtimeChecklist,
      title: { es: "Configuracion y secretos", en: "Configuration and secrets" },
      summary: {
        es: "Entiende como una app cambia por ambiente sin filtrar claves reales.",
        en: "Understand how an app changes by environment without leaking real keys."
      },
      beginnerGoal: {
        es: "Crear una plantilla .env.example util y documentar como usarla.",
        en: "Create a useful .env.example template and document how to use it."
      },
      outcome: {
        es: "Una persona nueva puede ejecutar el proyecto sin pedir secretos por chat.",
        en: "A new person can run the project without asking for secrets in chat."
      },
      estimatedTime: "25-40 min"
    },
    {
      id: "module-containers",
      category: "containerization",
      conceptIds: ["dockerfile", "container-image", "docker-compose"],
      labIds: ["lab-dockerfile", "lab-docker-compose", "lab-production-docker"],
      checklistIds: containerChecklist,
      title: { es: "Contenedores reproducibles", en: "Reproducible containers" },
      summary: {
        es: "Pasa de instrucciones manuales a una forma repetible de construir y ejecutar.",
        en: "Move from manual instructions to a repeatable way to build and run."
      },
      beginnerGoal: {
        es: "Entender la diferencia entre Dockerfile, imagen y Compose.",
        en: "Understand the difference between Dockerfile, image, and Compose."
      },
      outcome: {
        es: "Puedes construir o describir la imagen minima del proyecto y su entorno local.",
        en: "You can build or describe the project's minimal image and local environment."
      },
      estimatedTime: "45-75 min"
    },
    {
      id: "module-ci-cd",
      category: "ci_cd",
      conceptIds: ["ci-pipeline", "quality-gate", "rollback"],
      labIds: ["lab-ci-workflow", "lab-rollback-strategy"],
      checklistIds: ciChecklist,
      title: { es: "CI/CD y control de cambios", en: "CI/CD and change control" },
      summary: {
        es: "Automatiza validaciones para que cada cambio pase por las mismas reglas.",
        en: "Automate validations so every change goes through the same rules."
      },
      beginnerGoal: {
        es: "Saber que revisa un pipeline y por que protege los merges.",
        en: "Know what a pipeline checks and why it protects merges."
      },
      outcome: {
        es: "Puedes proponer un workflow minimo y explicar que bloquea.",
        en: "You can propose a minimal workflow and explain what it blocks."
      },
      estimatedTime: "40-70 min"
    },
    {
      id: "module-security-baseline",
      category: "security",
      conceptIds: ["dependency-scanning", "supply-chain-security", "secret-hygiene"],
      labIds: ["lab-security-scanning"],
      checklistIds: securityChecklist,
      title: { es: "Seguridad inicial", en: "Initial security" },
      summary: {
        es: "Cubre los riesgos basicos antes de pensar en auditorias avanzadas.",
        en: "Cover basic risks before thinking about advanced audits."
      },
      beginnerGoal: {
        es: "Diferenciar secretos, dependencias vulnerables y riesgos de supply chain.",
        en: "Differentiate secrets, vulnerable dependencies, and supply-chain risks."
      },
      outcome: {
        es: "Puedes agregar una primera barrera automatica contra vulnerabilidades conocidas.",
        en: "You can add a first automated barrier against known vulnerabilities."
      },
      estimatedTime: "40-65 min"
    },
    {
      id: "module-observability",
      category: "observability",
      conceptIds: ["health-check", "structured-logging", "metrics"],
      labIds: ["lab-observability", "lab-observability-dashboard"],
      checklistIds: observabilityChecklist,
      title: { es: "Visibilidad operativa", en: "Operational visibility" },
      summary: {
        es: "Aprende que senales permiten saber si la app esta viva, lenta o fallando.",
        en: "Learn which signals show whether the app is alive, slow, or failing."
      },
      beginnerGoal: {
        es: "Separar health checks, logs y metricas sin mezclarlos.",
        en: "Separate health checks, logs, and metrics without mixing them."
      },
      outcome: {
        es: "Puedes definir que observar primero despues de un despliegue.",
        en: "You can define what to observe first after a deployment."
      },
      estimatedTime: "35-70 min"
    },
    {
      id: "module-release-runbook",
      category: "documentation",
      conceptIds: ["runbook", "rollback", "health-check"],
      labIds: ["lab-deployment-docs", "lab-rollback-strategy", "lab-deployment-strategy"],
      checklistIds: documentationChecklist,
      title: { es: "Runbooks y despliegue", en: "Runbooks and deployment" },
      summary: {
        es: "Convierte pasos tribales en una guia que otra persona pueda seguir.",
        en: "Turn tribal steps into a guide another person can follow."
      },
      beginnerGoal: {
        es: "Entender que debe existir antes, durante y despues de desplegar.",
        en: "Understand what should exist before, during, and after deployment."
      },
      outcome: {
        es: "Puedes escribir una guia minima de release y verificacion.",
        en: "You can write a minimal release and verification guide."
      },
      estimatedTime: "35-60 min"
    },
    {
      id: "module-infrastructure",
      category: "infrastructure",
      conceptIds: ["iac", "kubernetes", "quality-gate"],
      labIds: ["lab-infrastructure-as-code", "lab-infrastructure-validation"],
      checklistIds: infrastructureChecklist,
      title: { es: "Infraestructura como codigo", en: "Infrastructure as Code" },
      summary: {
        es: "Introduce infraestructura versionada solo cuando el proyecto la necesita.",
        en: "Introduce versioned infrastructure only when the project needs it."
      },
      beginnerGoal: {
        es: "Distinguir documentacion de infraestructura, IaC real y orquestacion.",
        en: "Distinguish infrastructure documentation, real IaC, and orchestration."
      },
      outcome: {
        es: "Puedes decidir si el siguiente paso es documentar, validar o crear IaC.",
        en: "You can decide whether the next step is documentation, validation, or IaC."
      },
      estimatedTime: "45-90 min"
    }
  ];

  return templates.map((template): ModuleTemplate => ({
    ...template,
    conceptIds: unique(template.conceptIds),
    labIds: unique(template.labIds),
    checklistIds: unique(template.checklistIds),
    title: {
      es: template.title.es,
      en: template.title.en
    },
    summary: {
      es: template.summary.es,
      en: template.summary.en
    },
    beginnerGoal: {
      es: template.beginnerGoal.es,
      en: template.beginnerGoal.en
    },
    outcome: {
      es: template.outcome.es,
      en: template.outcome.en
    }
  }));
}
