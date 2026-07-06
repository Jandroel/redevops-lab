import type {
  DevOpsScoreCategoryKey,
  DevOpsScoreSummary,
  ExperienceLevel,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage,
  RepositoryAnalysis
} from "@redevops-lab/shared";
import { categoryLabel, levelGuidance, unique } from "./localization.js";

export interface GenerateLearningPathInput {
  analysis: RepositoryAnalysis;
  score: DevOpsScoreSummary;
  checklist: ProductionChecklistItem[];
  level: ExperienceLevel;
  language: ReportLanguage;
}

interface PathCandidate {
  id: string;
  category: DevOpsScoreCategoryKey;
  checklistIds: string[];
  labIds: string[];
  defaultFiles: string[];
  topics: string[];
  difficulty: ExperienceLevel;
  title: { es: string; en: string };
  description: { es: string; en: string };
  optional?: boolean;
}

export function generateLearningPath({
  analysis,
  score,
  checklist,
  level,
  language
}: GenerateLearningPathInput): LearningPathStep[] {
  const candidates = createPathCandidates(level);
  const recommended = candidates.filter((candidate) => candidateStatus(candidate, checklist) !== "completed");
  const filler = createImprovementCandidates(score.percentage, level);
  const selected = uniqueCandidates([...recommended, ...filler, ...candidates]).slice(0, 8);
  const minimum = selected.length >= 5 ? selected : uniqueCandidates([...selected, ...candidates]).slice(0, 5);

  return minimum.map((candidate, index) => {
    const status = candidateStatus(candidate, checklist);
    const relatedFiles = collectRelatedFiles(candidate, checklist, analysis);

    return {
      id: candidate.id,
      order: index + 1,
      title: candidate.title[language],
      description: `${candidate.description[language]} ${levelGuidance(level, language)}`,
      topics: unique([categoryLabel(candidate.category, language), ...candidate.topics]).slice(0, 5),
      relatedFiles,
      labs: candidate.labIds,
      status: candidate.optional ? "optional" : status,
      difficulty: candidate.difficulty
    };
  });
}

function createPathCandidates(level: ExperienceLevel): PathCandidate[] {
  const infrastructureOptional = level !== "advanced";

  return [
    {
      id: "path-runtime-configuration",
      category: "configuration",
      checklistIds: ["configuration.env_example", "configuration.docs"],
      labIds: ["lab-env-example"],
      defaultFiles: [".env.example", "README.md"],
      topics: ["environment variables", "secret hygiene"],
      difficulty: "beginner",
      title: {
        es: "Documenta la configuracion runtime",
        en: "Document runtime configuration"
      },
      description: {
        es: "Aclara que variables y pasos necesita el proyecto para ejecutarse.",
        en: "Clarify which variables and setup steps the project needs to run."
      }
    },
    {
      id: "path-containerize-application",
      category: "containerization",
      checklistIds: ["containerization.dockerfile", "containerization.dockerignore"],
      labIds: ["lab-dockerfile"],
      defaultFiles: ["Dockerfile", ".dockerignore"],
      topics: ["Docker", "container image"],
      difficulty: "beginner",
      title: {
        es: "Conteneriza la aplicacion",
        en: "Containerize the application"
      },
      description: {
        es: "Agrega una ruta reproducible para empaquetar la aplicacion como imagen.",
        en: "Add a reproducible path to package the application as an image."
      }
    },
    {
      id: "path-local-orchestration",
      category: "containerization",
      checklistIds: ["containerization.compose"],
      labIds: ["lab-docker-compose"],
      defaultFiles: ["docker-compose.yml", ".env.example"],
      topics: ["local services", "developer experience"],
      difficulty: "beginner",
      title: {
        es: "Crea un entorno local reproducible",
        en: "Create a reproducible local environment"
      },
      description: {
        es: "Define como levantar dependencias locales sin configuracion manual.",
        en: "Define how to run local dependencies without manual setup."
      }
    },
    {
      id: "path-ci-validation",
      category: "ci_cd",
      checklistIds: ["ci_cd.pipeline", "ci_cd.tests_build"],
      labIds: ["lab-ci-workflow"],
      defaultFiles: [".github/workflows/ci.yml", "package.json"],
      topics: ["pull requests", "quality gates"],
      difficulty: "intermediate",
      title: {
        es: "Automatiza validaciones con CI",
        en: "Automate validation with CI"
      },
      description: {
        es: "Ejecuta instalacion, tests, typecheck o build antes de mergear cambios.",
        en: "Run install, tests, typecheck, or build before changes are merged."
      }
    },
    {
      id: "path-security-baseline",
      category: "security",
      checklistIds: ["security.dependabot", "security.scanning", "security.policy"],
      labIds: ["lab-security-scanning"],
      defaultFiles: [".github/dependabot.yml", ".github/workflows/security.yml", "SECURITY.md"],
      topics: ["supply chain", "dependency scanning"],
      difficulty: "intermediate",
      title: {
        es: "Agrega seguridad basica de supply chain",
        en: "Add basic supply-chain security"
      },
      description: {
        es: "Introduce senales visibles para actualizaciones, escaneo y politica de seguridad.",
        en: "Introduce visible signals for updates, scanning, and security policy."
      }
    },
    {
      id: "path-operational-visibility",
      category: "observability",
      checklistIds: ["observability.health", "observability.logging_metrics"],
      labIds: ["lab-observability"],
      defaultFiles: ["src/health", "README.md", "docs/observability.md"],
      topics: ["health checks", "logging", "metrics"],
      difficulty: "intermediate",
      title: {
        es: "Agrega health checks y visibilidad operativa",
        en: "Add health checks and operational visibility"
      },
      description: {
        es: "Haz que el estado del servicio sea visible para despliegues y monitoreo inicial.",
        en: "Make service state visible for deployments and initial monitoring."
      }
    },
    {
      id: "path-deployment-documentation",
      category: "documentation",
      checklistIds: ["documentation.readme", "documentation.docs", "documentation.deployment"],
      labIds: ["lab-deployment-docs"],
      defaultFiles: ["README.md", "docs/deployment.md"],
      topics: ["runbooks", "deployment docs"],
      difficulty: "beginner",
      title: {
        es: "Documenta el proceso de despliegue",
        en: "Document the deployment process"
      },
      description: {
        es: "Explica como preparar, desplegar y verificar una version.",
        en: "Explain how to prepare, deploy, and verify a release."
      }
    },
    {
      id: "path-infrastructure-as-code",
      category: "infrastructure",
      checklistIds: ["infrastructure.iac_or_orchestration"],
      labIds: ["lab-infrastructure-as-code"],
      defaultFiles: ["terraform/", "k8s/", "helm/"],
      topics: ["Terraform", "Kubernetes", "reviewable infrastructure"],
      difficulty: "advanced",
      title: {
        es: "Introduce infraestructura como codigo",
        en: "Introduce infrastructure as code"
      },
      description: {
        es: "Versiona infraestructura cuando el proyecto ya tenga una ruta de despliegue clara.",
        en: "Version infrastructure once the project has a clear deployment path."
      },
      optional: infrastructureOptional
    }
  ];
}

function createImprovementCandidates(scorePercentage: number, level: ExperienceLevel): PathCandidate[] {
  const advanced = level === "advanced" || scorePercentage >= 70;

  return [
    {
      id: "path-production-docker",
      category: "containerization",
      checklistIds: [],
      labIds: ["lab-production-docker"],
      defaultFiles: ["Dockerfile", ".dockerignore"],
      topics: ["multi-stage builds", "image hardening"],
      difficulty: advanced ? "advanced" : "intermediate",
      title: {
        es: "Mejora la imagen Docker de produccion",
        en: "Improve the production Docker image"
      },
      description: {
        es: "Refina tamanio, cache, usuario runtime y estrategia multi-stage.",
        en: "Refine size, cache, runtime user, and multi-stage strategy."
      },
      optional: true
    },
    {
      id: "path-observability-dashboards",
      category: "observability",
      checklistIds: [],
      labIds: ["lab-observability-dashboard"],
      defaultFiles: ["docs/observability.md", "grafana/"],
      topics: ["dashboards", "SLOs"],
      difficulty: advanced ? "advanced" : "intermediate",
      title: {
        es: "Prepara dashboards de observabilidad",
        en: "Prepare observability dashboards"
      },
      description: {
        es: "Define que senales operativas debe revisar el equipo.",
        en: "Define which operational signals the team should review."
      },
      optional: true
    },
    {
      id: "path-rollback-strategy",
      category: "ci_cd",
      checklistIds: [],
      labIds: ["lab-rollback-strategy"],
      defaultFiles: ["docs/deployment.md", "docs/runbooks/rollback.md"],
      topics: ["rollback", "release safety"],
      difficulty: "advanced",
      title: {
        es: "Documenta una estrategia de rollback",
        en: "Document a rollback strategy"
      },
      description: {
        es: "Prepara una respuesta clara si una version falla despues del deploy.",
        en: "Prepare a clear response if a release fails after deployment."
      },
      optional: true
    },
    {
      id: "path-deployment-strategy",
      category: "documentation",
      checklistIds: [],
      labIds: ["lab-deployment-strategy"],
      defaultFiles: ["docs/deployment.md", "docs/release-strategy.md"],
      topics: ["deployment strategy", "release review"],
      difficulty: advanced ? "advanced" : "intermediate",
      title: {
        es: "Refina la estrategia de despliegue",
        en: "Refine the deployment strategy"
      },
      description: {
        es: "Conecta ambientes, validaciones, rollback y criterios de release.",
        en: "Connect environments, checks, rollback, and release criteria."
      },
      optional: true
    },
    {
      id: "path-infrastructure-validation",
      category: "infrastructure",
      checklistIds: [],
      labIds: ["lab-infrastructure-validation"],
      defaultFiles: ["terraform/", ".github/workflows/infra.yml"],
      topics: ["infrastructure validation", "policy checks"],
      difficulty: "advanced",
      title: {
        es: "Agrega validacion de infraestructura",
        en: "Add infrastructure validation"
      },
      description: {
        es: "Prepara validaciones para cambios de infraestructura antes de aplicarlos.",
        en: "Prepare validation for infrastructure changes before they are applied."
      },
      optional: true
    }
  ];
}

function candidateStatus(candidate: PathCandidate, checklist: ProductionChecklistItem[]): LearningPathStep["status"] {
  if (candidate.optional || candidate.checklistIds.length === 0) {
    return "optional";
  }

  const items = candidate.checklistIds
    .map((id) => checklist.find((item) => item.id === id))
    .filter((item): item is ProductionChecklistItem => Boolean(item));

  return items.length > 0 && items.every((item) => item.status === "done") ? "completed" : "recommended";
}

function collectRelatedFiles(
  candidate: PathCandidate,
  checklist: ProductionChecklistItem[],
  analysis: RepositoryAnalysis
): string[] {
  const evidence = candidate.checklistIds.flatMap((id) => {
    const item = checklist.find((entry) => entry.id === id);

    return item?.evidence ?? [];
  });
  const existingFiles = analysis.tree.filter((item) => item.type === "file").map((item) => item.path);

  return unique([...evidence.filter(isFileEvidence), ...candidate.defaultFiles, ...existingFiles]).slice(0, 8);
}

function isFileEvidence(value: string): boolean {
  const normalized = value.toLowerCase();

  return !normalized.startsWith("no ") && !normalized.startsWith("no se ");
}

function uniqueCandidates(candidates: PathCandidate[]): PathCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    if (seen.has(candidate.id)) {
      return false;
    }

    seen.add(candidate.id);
    return true;
  });
}
