import type {
  ChecklistItemStatus,
  DevOpsScoreRule,
  DevOpsSignal,
  ExperienceLevel,
  ProductionChecklistCategory,
  ProductionChecklistItem,
  ReportLanguage,
  RepositoryAnalysis,
  DevOpsScoreSummary
} from "@redevops-lab/shared";
import { noConfigurationFile, noSignal, unique } from "./localization.js";

export interface GenerateProductionChecklistInput {
  analysis: RepositoryAnalysis;
  score: DevOpsScoreSummary;
  level: ExperienceLevel;
  language: ReportLanguage;
}

interface ChecklistContext {
  files: string[];
  rules: Map<string, DevOpsScoreRule>;
  signals: Map<string, DevOpsSignal>;
}

interface ChecklistItemDefinition {
  id: string;
  category: ProductionChecklistCategory;
  priority: "low" | "medium" | "high";
  title: { es: string; en: string };
  description: { es: string; en: string };
  done(context: ChecklistContext): boolean;
  evidence(context: ChecklistContext): string[];
  missingStatus?: ChecklistItemStatus;
  missingEvidence?: (language: ReportLanguage) => string;
}

export function generateProductionChecklist({
  analysis,
  score,
  level,
  language
}: GenerateProductionChecklistInput): ProductionChecklistItem[] {
  const context = createChecklistContext(analysis, score);
  const definitions = createChecklistDefinitions(level);

  return definitions.slice(0, 18).map((definition) => {
    const done = definition.done(context);
    const evidence = done
      ? definition.evidence(context)
      : [definition.missingEvidence?.(language) ?? noSignal(language)];

    return {
      id: definition.id,
      title: definition.title[language],
      description: definition.description[language],
      status: done ? "done" : definition.missingStatus ?? "missing",
      category: definition.category,
      priority: definition.priority,
      evidence: unique(evidence).slice(0, 6)
    };
  });
}

function createChecklistDefinitions(level: ExperienceLevel): ChecklistItemDefinition[] {
  const deployPriority = level === "advanced" ? "medium" : "low";
  const infrastructurePriority = level === "advanced" ? "high" : "medium";

  return [
    {
      id: "configuration.env_example",
      category: "configuration",
      priority: "high",
      title: { es: "Existe .env.example", en: ".env.example exists" },
      description: {
        es: "Se detecto una plantilla para variables de entorno o configuracion runtime.",
        en: "A template for runtime environment variables was detected."
      },
      done: (context) => signalDetected(context, "env_example"),
      evidence: (context) => signalEvidence(context, "env_example"),
      missingEvidence: noConfigurationFile
    },
    {
      id: "configuration.docs",
      category: "configuration",
      priority: "medium",
      title: { es: "Configuracion documentada", en: "Configuration documented" },
      description: {
        es: "README o docs parecen explicar como configurar el proyecto.",
        en: "README or docs appear to explain how the project is configured."
      },
      done: (context) => rulePassed(context, "configuration.docs"),
      evidence: (context) => ruleEvidence(context, "configuration.docs")
    },
    {
      id: "containerization.dockerfile",
      category: "containerization",
      priority: "high",
      title: { es: "Dockerfile detectado", en: "Dockerfile exists" },
      description: {
        es: "Se detecto una ruta visible para construir una imagen de contenedor.",
        en: "A visible container image build path was detected."
      },
      done: (context) => signalDetected(context, "dockerfile"),
      evidence: (context) => signalEvidence(context, "dockerfile")
    },
    {
      id: "containerization.compose",
      category: "containerization",
      priority: "medium",
      title: { es: "Docker Compose detectado", en: "Docker Compose exists" },
      description: {
        es: "Se detecto orquestacion local reproducible para servicios de desarrollo.",
        en: "A reproducible local service orchestration file was detected."
      },
      done: (context) => signalDetected(context, "docker_compose"),
      evidence: (context) => signalEvidence(context, "docker_compose")
    },
    {
      id: "containerization.dockerignore",
      category: "containerization",
      priority: "medium",
      title: { es: ".dockerignore detectado", en: ".dockerignore exists" },
      description: {
        es: "Se detecto una forma de reducir el contexto Docker y evitar archivos locales.",
        en: "A Docker ignore file was detected for leaner and safer build contexts."
      },
      done: (context) => rulePassed(context, "containerization.dockerignore"),
      evidence: (context) => ruleEvidence(context, "containerization.dockerignore")
    },
    {
      id: "ci_cd.pipeline",
      category: "ci_cd",
      priority: "high",
      title: { es: "Pipeline CI detectado", en: "CI pipeline exists" },
      description: {
        es: "Se detecto al menos una configuracion de CI/CD visible.",
        en: "At least one visible CI/CD configuration was detected."
      },
      done: (context) => signalDetected(context, "github_actions") || signalDetected(context, "external_ci"),
      evidence: (context) =>
        unique([...signalEvidence(context, "github_actions"), ...signalEvidence(context, "external_ci")])
    },
    {
      id: "ci_cd.tests_build",
      category: "ci_cd",
      priority: "high",
      title: {
        es: "Workflow de tests/build probable",
        en: "Tests/build workflow likely exists"
      },
      description: {
        es: "Los nombres de workflows sugieren validacion automatizada de tests o build.",
        en: "Workflow names suggest automated test or build validation."
      },
      done: (context) => rulePassed(context, "ci_cd.tests") || rulePassed(context, "ci_cd.build"),
      evidence: (context) => unique([...ruleEvidence(context, "ci_cd.tests"), ...ruleEvidence(context, "ci_cd.build")])
    },
    {
      id: "ci_cd.deploy_release",
      category: "ci_cd",
      priority: deployPriority,
      title: {
        es: "Workflow deploy/release probable",
        en: "Deploy/release workflow likely exists"
      },
      description: {
        es: "Los nombres de workflows sugieren automatizacion de despliegue o release.",
        en: "Workflow names suggest deployment or release automation."
      },
      done: (context) => rulePassed(context, "ci_cd.deploy"),
      evidence: (context) => ruleEvidence(context, "ci_cd.deploy"),
      missingStatus: "recommended"
    },
    {
      id: "security.dependabot",
      category: "security",
      priority: "medium",
      title: { es: "Dependabot detectado", en: "Dependabot exists" },
      description: {
        es: "Se detecto automatizacion para revisar actualizaciones de dependencias.",
        en: "Dependency update automation was detected."
      },
      done: (context) => rulePassed(context, "security.dependabot"),
      evidence: (context) => ruleEvidence(context, "security.dependabot")
    },
    {
      id: "security.scanning",
      category: "security",
      priority: "high",
      title: { es: "Security scanning detectado", en: "Security scanning exists" },
      description: {
        es: "Se detectaron senales de analisis de dependencias, codigo o secretos.",
        en: "Dependency, code, or secret scanning signals were detected."
      },
      done: (context) =>
        rulePassed(context, "security.codeql") || rulePassed(context, "security.scanning"),
      evidence: (context) =>
        unique([...ruleEvidence(context, "security.codeql"), ...ruleEvidence(context, "security.scanning")])
    },
    {
      id: "security.policy",
      category: "security",
      priority: "medium",
      title: { es: "SECURITY.md detectado", en: "SECURITY.md exists" },
      description: {
        es: "Se detecto documentacion sobre reporte o manejo de vulnerabilidades.",
        en: "Security reporting or vulnerability handling documentation was detected."
      },
      done: (context) => rulePassed(context, "security.policy"),
      evidence: (context) => ruleEvidence(context, "security.policy")
    },
    {
      id: "observability.health",
      category: "observability",
      priority: "high",
      title: { es: "Health checks detectados", en: "Health checks exist" },
      description: {
        es: "Se detecto una senal de health, readiness o liveness.",
        en: "A health, readiness, or liveness signal was detected."
      },
      done: (context) => rulePassed(context, "observability.health"),
      evidence: (context) => ruleEvidence(context, "observability.health")
    },
    {
      id: "observability.logging_metrics",
      category: "observability",
      priority: "medium",
      title: {
        es: "Logging o metricas detectadas",
        en: "Logging or metrics signals exist"
      },
      description: {
        es: "Se detectaron senales visibles de logs, metricas, Prometheus, tracing o dashboards.",
        en: "Visible logging, metrics, Prometheus, tracing, or dashboard signals were detected."
      },
      done: (context) =>
        rulePassed(context, "observability.logging") ||
        rulePassed(context, "observability.metrics") ||
        rulePassed(context, "observability.tracing"),
      evidence: (context) =>
        unique([
          ...ruleEvidence(context, "observability.logging"),
          ...ruleEvidence(context, "observability.metrics"),
          ...ruleEvidence(context, "observability.tracing")
        ]),
      missingStatus: "recommended"
    },
    {
      id: "documentation.readme",
      category: "documentation",
      priority: "high",
      title: { es: "README detectado", en: "README exists" },
      description: {
        es: "El repositorio tiene un punto de entrada para desarrolladores.",
        en: "The repository has an entry point for developers."
      },
      done: (context) => signalDetected(context, "readme"),
      evidence: (context) => signalEvidence(context, "readme")
    },
    {
      id: "documentation.docs",
      category: "documentation",
      priority: "medium",
      title: { es: "Carpeta docs detectada", en: "Docs folder exists" },
      description: {
        es: "Se detecto espacio para documentacion tecnica u operativa.",
        en: "A space for technical or operational documentation was detected."
      },
      done: (context) => signalDetected(context, "docs_directory"),
      evidence: (context) => signalEvidence(context, "docs_directory")
    },
    {
      id: "documentation.deployment",
      category: "documentation",
      priority: "medium",
      title: {
        es: "Documentacion de despliegue detectada",
        en: "Deployment documentation exists"
      },
      description: {
        es: "Se detectaron documentos relacionados con despliegue o release.",
        en: "Deployment or release-oriented documentation was detected."
      },
      done: (context) => signalDetected(context, "deployment_docs"),
      evidence: (context) => signalEvidence(context, "deployment_docs")
    },
    {
      id: "infrastructure.iac_or_orchestration",
      category: "infrastructure",
      priority: infrastructurePriority,
      title: {
        es: "IaC u orquestacion detectada",
        en: "IaC or orchestration exists"
      },
      description: {
        es: "Se detectaron senales de Terraform, Pulumi, Kubernetes o Helm.",
        en: "Terraform, Pulumi, Kubernetes, or Helm signals were detected."
      },
      done: (context) =>
        rulePassed(context, "infrastructure.iac") ||
        rulePassed(context, "infrastructure.kubernetes") ||
        rulePassed(context, "infrastructure.helm"),
      evidence: (context) =>
        unique([
          ...ruleEvidence(context, "infrastructure.iac"),
          ...ruleEvidence(context, "infrastructure.kubernetes"),
          ...ruleEvidence(context, "infrastructure.helm")
        ]),
      missingStatus: "recommended"
    }
  ];
}

function createChecklistContext(analysis: RepositoryAnalysis, score: DevOpsScoreSummary): ChecklistContext {
  const treeFiles = analysis.tree.filter((item) => item.type === "file").map((item) => item.path);
  const files = unique([...treeFiles, ...analysis.importantFiles]).sort((a, b) => a.localeCompare(b));
  const rules = new Map(score.categories.flatMap((category) => category.rules).map((rule) => [rule.id, rule]));
  const signals = new Map(analysis.devopsSignals.map((signal) => [signal.key, signal]));

  return {
    files,
    rules,
    signals
  };
}

function signalDetected(context: ChecklistContext, key: string): boolean {
  return context.signals.get(key)?.detected ?? false;
}

function signalEvidence(context: ChecklistContext, key: string): string[] {
  return context.signals.get(key)?.files ?? [];
}

function rulePassed(context: ChecklistContext, id: string): boolean {
  return context.rules.get(id)?.passed ?? false;
}

function ruleEvidence(context: ChecklistContext, id: string): string[] {
  return context.rules.get(id)?.evidence ?? [];
}
