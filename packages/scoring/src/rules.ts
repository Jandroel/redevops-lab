import type {
  DevOpsScoreCategoryKey,
  DevOpsScoreRule,
  FindingSeverity,
  RepositoryAnalysis,
  RepositoryContentCheck,
  RepositoryContentFileKind
} from "@redevops-lab/shared";

interface RuleDefinition {
  id: string;
  category: DevOpsScoreCategoryKey;
  title: string;
  description: string;
  maxPoints: number;
  recommendation: string;
  severity: FindingSeverity;
  evidence(analysis: RepositoryAnalysis, context: RuleContext): string[];
}

export interface RuleContext {
  files: string[];
  lowerFiles: string[];
  signalFiles: Map<string, string[]>;
  detectedSignals: Set<string>;
  contentChecks: Map<string, RepositoryContentCheck>;
  analyzedContentKinds: Set<RepositoryContentFileKind>;
}

export function createRuleContext(analysis: RepositoryAnalysis): RuleContext {
  const files = [
    ...analysis.tree.filter((item) => item.type === "file").map((item) => item.path),
    ...analysis.importantFiles
  ];
  const uniqueFiles = [...new Set(files)].sort((a, b) => a.localeCompare(b));
  const signalFiles = new Map(
    analysis.devopsSignals.map((signal) => [signal.key, signal.detected ? signal.files : []])
  );

  return {
    files: uniqueFiles,
    lowerFiles: uniqueFiles.map((file) => file.toLowerCase()),
    signalFiles,
    contentChecks: new Map(
      (analysis.contentAnalysis?.checks ?? []).map((check) => [check.key, check])
    ),
    analyzedContentKinds: new Set((analysis.contentAnalysis?.files ?? []).map((file) => file.kind)),
    detectedSignals: new Set(
      analysis.devopsSignals.filter((signal) => signal.detected).map((signal) => signal.key)
    )
  };
}

export function evaluateRules(analysis: RepositoryAnalysis): DevOpsScoreRule[] {
  const context = createRuleContext(analysis);

  return ruleDefinitions.map((rule) => {
    const evidence = unique(rule.evidence(analysis, context)).slice(0, 10);
    const passed = evidence.length > 0;

    return {
      id: rule.id,
      category: rule.category,
      title: rule.title,
      description: rule.description,
      points: passed ? rule.maxPoints : 0,
      maxPoints: rule.maxPoints,
      passed,
      evidence,
      recommendation: rule.recommendation,
      severity: passed ? undefined : rule.severity
    };
  });
}

const ruleDefinitions: RuleDefinition[] = [
  {
    id: "containerization.dockerfile",
    category: "containerization",
    title: "Dockerfile detected",
    description:
      "A Dockerfile indicates that the application can be packaged as a container image.",
    maxPoints: 5,
    recommendation: "Add a Dockerfile or document the container image build strategy.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "dockerfile")
  },
  {
    id: "containerization.dockerignore",
    category: "containerization",
    title: ".dockerignore detected",
    description: "A .dockerignore keeps the Docker build context small and avoids copying secrets.",
    maxPoints: 3,
    recommendation:
      "Add .dockerignore to keep local files, dependencies, and secrets out of images.",
    severity: "medium",
    evidence: (_analysis, context) => byFilename(context, [".dockerignore"])
  },
  {
    id: "containerization.compose",
    category: "containerization",
    title: "Docker Compose detected",
    description: "Compose files help developers run multi-service environments locally.",
    maxPoints: 4,
    recommendation:
      "Add docker-compose.yml for local dependencies and repeatable development setup.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "docker_compose")
  },
  {
    id: "containerization.multi_stage",
    category: "containerization",
    title: "Multi-stage container build detected",
    description:
      "A multi-stage Dockerfile can keep runtime images smaller and separate build tooling.",
    maxPoints: 3,
    recommendation:
      "Use a multi-stage Dockerfile when build dependencies do not belong in the runtime image.",
    severity: "medium",
    evidence: (_analysis, context) => deepEvidence(context, ["dockerfile"], ["docker.multi_stage"])
  },
  {
    id: "containerization.reproducible_install",
    category: "containerization",
    title: "Reproducible dependency install detected",
    description: "The Docker build uses an install mode intended to honor the dependency lockfile.",
    maxPoints: 3,
    recommendation: "Use a lockfile-aware, reproducible dependency install in the Docker build.",
    severity: "medium",
    evidence: (_analysis, context) =>
      deepEvidence(context, ["dockerfile"], ["docker.reproducible_install"])
  },
  {
    id: "containerization.healthcheck",
    category: "containerization",
    title: "Container health check detected",
    description: "The container image declares how its runtime health should be checked.",
    maxPoints: 2,
    recommendation:
      "Add a meaningful Docker HEALTHCHECK when the service exposes a health endpoint.",
    severity: "low",
    evidence: (_analysis, context) => deepEvidence(context, ["dockerfile"], ["docker.healthcheck"])
  },
  {
    id: "ci_cd.pipeline",
    category: "ci_cd",
    title: "CI/CD pipeline detected",
    description:
      "A CI/CD pipeline validates changes and creates the foundation for automated delivery.",
    maxPoints: 6,
    recommendation: "Add GitHub Actions or another CI system for pull request validation.",
    severity: "high",
    evidence: (_analysis, context) =>
      unique([...bySignal(context, "github_actions"), ...bySignal(context, "external_ci")])
  },
  {
    id: "ci_cd.pull_request",
    category: "ci_cd",
    title: "Pull request validation detected",
    description: "At least one workflow is configured to validate pull requests.",
    maxPoints: 3,
    recommendation: "Trigger validation workflows for pull requests before changes are merged.",
    severity: "high",
    evidence: (_analysis, context) => deepEvidence(context, ["workflow"], ["ci.pull_request"])
  },
  {
    id: "ci_cd.tests",
    category: "ci_cd",
    title: "Automated tests detected",
    description: "Workflow jobs or steps execute repository tests.",
    maxPoints: 3,
    recommendation: "Add a test workflow that runs on every pull request.",
    severity: "medium",
    evidence: (_analysis, context) =>
      deepOrFallback(context, ["workflow"], ["ci.tests"], () =>
        workflowByName(context, /(test|check|quality|ci)/)
      )
  },
  {
    id: "ci_cd.lint",
    category: "ci_cd",
    title: "Automated linting detected",
    description: "Workflow jobs or steps execute a lint validation.",
    maxPoints: 2,
    recommendation: "Run the repository linter in CI.",
    severity: "medium",
    evidence: (_analysis, context) => deepEvidence(context, ["workflow"], ["ci.lint"])
  },
  {
    id: "ci_cd.typecheck",
    category: "ci_cd",
    title: "Automated type checking detected",
    description: "Workflow jobs or steps execute a type-checking validation.",
    maxPoints: 2,
    recommendation: "Run the project's type checker in CI when the stack supports it.",
    severity: "medium",
    evidence: (_analysis, context) => deepEvidence(context, ["workflow"], ["ci.typecheck"])
  },
  {
    id: "ci_cd.build",
    category: "ci_cd",
    title: "Automated build detected",
    description: "Workflow jobs or steps execute a build validation.",
    maxPoints: 2,
    recommendation: "Add a build job to the CI pipeline.",
    severity: "medium",
    evidence: (_analysis, context) =>
      deepOrFallback(context, ["workflow"], ["ci.build"], () =>
        workflowByName(context, /(build|ci)/)
      )
  },
  {
    id: "ci_cd.deploy",
    category: "ci_cd",
    title: "Automated deploy or release detected",
    description: "Workflow jobs or steps execute deployment, release, or publishing automation.",
    maxPoints: 2,
    recommendation: "Add a deploy or release workflow once the project is production-ready.",
    severity: "low",
    evidence: (_analysis, context) =>
      deepOrFallback(context, ["workflow"], ["ci.deploy"], () =>
        workflowByName(context, /(deploy|release|publish)/)
      )
  },
  {
    id: "configuration.env_example",
    category: "configuration",
    title: "Environment example detected",
    description: "An example environment file documents required runtime configuration.",
    maxPoints: 4,
    recommendation: "Add .env.example or .env.sample with all required variables.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "env_example")
  },
  {
    id: "configuration.env_safety",
    category: "configuration",
    title: "Safe environment example detected",
    description:
      "The example environment file documents variables without suspicious credential values.",
    maxPoints: 3,
    recommendation:
      "Keep only empty, fake, or clearly documented placeholder values in environment examples.",
    severity: "high",
    evidence: (_analysis, context) =>
      deepEvidence(context, ["env_example"], ["env.safe_placeholders"])
  },
  {
    id: "configuration.docs",
    category: "configuration",
    title: "Configuration documentation detected",
    description:
      "README content explains runtime configuration, or configuration artifacts have supporting docs.",
    maxPoints: 3,
    recommendation: "Document configuration in README or docs.",
    severity: "low",
    evidence: (_analysis, context) =>
      deepOrFallback(context, ["readme"], ["readme.configuration"], () => {
        const docs = unique([
          ...bySignal(context, "readme"),
          ...bySignal(context, "docs_directory")
        ]);
        const config = unique([
          ...bySignal(context, "env_example"),
          ...bySignal(context, "config_directory")
        ]);

        return docs.length > 0 && config.length > 0 ? docs.slice(0, 3) : [];
      })
  },
  {
    id: "configuration.config_directory",
    category: "configuration",
    title: "Configuration directory detected",
    description: "A config directory indicates configuration is separated from application code.",
    maxPoints: 2,
    recommendation: "Create a config directory or central configuration module.",
    severity: "low",
    evidence: (_analysis, context) => bySignal(context, "config_directory")
  },
  {
    id: "configuration.environments",
    category: "configuration",
    title: "Environment separation inferred",
    description: "Environment-specific or deployment configuration files were detected.",
    maxPoints: 3,
    recommendation: "Add environment-specific config examples for local, staging, and production.",
    severity: "low",
    evidence: (_analysis, context) =>
      byPathPattern(
        context,
        /(docker-compose\.override|\.env\.|environment|environments|deployment|config\/.*env)/
      )
  },
  {
    id: "security.dependabot",
    category: "security",
    title: "Dependabot detected",
    description: "Dependabot automates dependency update checks.",
    maxPoints: 4,
    recommendation: "Add .github/dependabot.yml for dependency update automation.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(^|\/)dependabot\.ya?ml$/)
  },
  {
    id: "security.codeql",
    category: "security",
    title: "CodeQL detected",
    description: "CodeQL or equivalent code scanning helps catch security issues in CI.",
    maxPoints: 3,
    recommendation: "Add CodeQL or another static analysis workflow.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /codeql\.ya?ml$/)
  },
  {
    id: "security.scanning",
    category: "security",
    title: "Security scanner detected",
    description: "Workflow content or repository files indicate automated security scanning.",
    maxPoints: 3,
    recommendation: "Add Snyk, Trivy, Semgrep, or Gitleaks to CI.",
    severity: "medium",
    evidence: (_analysis, context) =>
      unique([
        ...byPathPattern(context, /(snyk|trivy|semgrep|gitleaks)/),
        ...byContentCheck(context, ["ci.security"])
      ])
  },
  {
    id: "security.policy",
    category: "security",
    title: "Security policy detected",
    description: "SECURITY.md documents how to report vulnerabilities.",
    maxPoints: 2,
    recommendation: "Add SECURITY.md with vulnerability reporting guidance.",
    severity: "low",
    evidence: (_analysis, context) => bySignal(context, "security_docs")
  },
  {
    id: "security.container_hardening",
    category: "security",
    title: "Container hardening detected",
    description: "The Dockerfile uses non-root execution or a pinned base image.",
    maxPoints: 3,
    recommendation:
      "Run the container as a non-root user and pin the base image to an intentional version.",
    severity: "medium",
    evidence: (_analysis, context) =>
      deepEvidence(context, ["dockerfile"], ["docker.non_root", "docker.pinned_base"])
  },
  {
    id: "observability.health",
    category: "observability",
    title: "Health check signal detected",
    description: "Health checks help deployment platforms and monitors understand service state.",
    maxPoints: 3,
    recommendation: "Add a /health endpoint or documented health check.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(health|readiness|liveness)/)
  },
  {
    id: "documentation.setup",
    category: "documentation",
    title: "Local setup documentation detected",
    description: "README content explains how to install or run the project locally.",
    maxPoints: 2,
    recommendation: "Add concise installation and local run instructions to README.md.",
    severity: "medium",
    evidence: (_analysis, context) => deepEvidence(context, ["readme"], ["readme.setup"])
  },
  {
    id: "observability.logging",
    category: "observability",
    title: "Logging signal detected",
    description: "Logging-related files suggest the project has operational visibility hooks.",
    maxPoints: 3,
    recommendation: "Add structured logging guidance and runtime log conventions.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(logging|logger|log)/)
  },
  {
    id: "observability.metrics",
    category: "observability",
    title: "Metrics or Prometheus detected",
    description: "Metrics and Prometheus signals improve production observability.",
    maxPoints: 2,
    recommendation: "Add metrics instrumentation or Prometheus scrape configuration.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(metrics|prometheus)/)
  },
  {
    id: "observability.tracing",
    category: "observability",
    title: "Tracing or dashboard signal detected",
    description: "Grafana, OpenTelemetry, or OTEL signals indicate observability maturity.",
    maxPoints: 2,
    recommendation: "Add OpenTelemetry tracing or Grafana dashboards for key services.",
    severity: "low",
    evidence: (_analysis, context) => byPathPattern(context, /(grafana|opentelemetry|otel)/)
  },
  {
    id: "documentation.readme",
    category: "documentation",
    title: "README detected",
    description: "README.md gives contributors an entry point into the project.",
    maxPoints: 2,
    recommendation: "Add README.md with setup, scripts, and project overview.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "readme")
  },
  {
    id: "documentation.docs",
    category: "documentation",
    title: "Docs directory detected",
    description: "A docs directory gives room for architecture and operations documentation.",
    maxPoints: 2,
    recommendation: "Add docs/ with architecture, deployment, and operational notes.",
    severity: "low",
    evidence: (_analysis, context) => bySignal(context, "docs_directory")
  },
  {
    id: "documentation.deployment",
    category: "documentation",
    title: "Deployment documentation detected",
    description: "Deployment docs make production handoff and review easier.",
    maxPoints: 2,
    recommendation: "Add DEPLOYMENT.md or docs/deployment.md.",
    severity: "medium",
    evidence: (_analysis, context) =>
      unique([
        ...bySignal(context, "deployment_docs"),
        ...byContentCheck(context, ["readme.deployment"])
      ])
  },
  {
    id: "documentation.contributing",
    category: "documentation",
    title: "Contributing guide detected",
    description: "CONTRIBUTING.md clarifies how contributors should work with the project.",
    maxPoints: 1,
    recommendation: "Add CONTRIBUTING.md for setup, branching, and contribution workflow.",
    severity: "low",
    evidence: (_analysis, context) => byFilename(context, ["contributing.md"])
  },
  {
    id: "documentation.license",
    category: "documentation",
    title: "License detected",
    description: "A license clarifies usage and distribution rights.",
    maxPoints: 1,
    recommendation: "Add a LICENSE file.",
    severity: "low",
    evidence: (analysis, context) => {
      const files = byFilename(context, ["license", "license.md", "license.txt"]);

      return files.length > 0
        ? files
        : analysis.repository.license
          ? [analysis.repository.license]
          : [];
    }
  },
  {
    id: "infrastructure.iac",
    category: "infrastructure",
    title: "Infrastructure as Code detected",
    description: "Terraform or Pulumi files indicate infrastructure can be reviewed and versioned.",
    maxPoints: 4,
    recommendation: "Add Terraform or Pulumi for infrastructure that should be reproducible.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(terraform\/|\.tf$|pulumi)/)
  },
  {
    id: "infrastructure.kubernetes",
    category: "infrastructure",
    title: "Kubernetes manifests detected",
    description: "Kubernetes manifests indicate orchestration readiness.",
    maxPoints: 3,
    recommendation:
      "Add Kubernetes manifests when orchestration becomes part of the deployment target.",
    severity: "low",
    evidence: (_analysis, context) =>
      byPathPattern(
        context,
        /(^k8s\/|^kubernetes\/|deployment\.ya?ml$|service\.ya?ml$|ingress\.ya?ml$)/
      )
  },
  {
    id: "infrastructure.helm",
    category: "infrastructure",
    title: "Helm chart detected",
    description: "Helm charts package Kubernetes workloads for repeatable installs.",
    maxPoints: 2,
    recommendation: "Add a Helm chart if the project targets Kubernetes deployments.",
    severity: "low",
    evidence: (_analysis, context) => byPathPattern(context, /(^helm\/|chart\.yaml$)/)
  },
  {
    id: "infrastructure.deployment_config",
    category: "infrastructure",
    title: "Deployment or infra config detected",
    description: "Serverless, infra, or deployment config signals deployment planning.",
    maxPoints: 1,
    recommendation: "Add explicit deployment configuration or document why it is not needed.",
    severity: "low",
    evidence: (_analysis, context) =>
      byPathPattern(context, /(serverless\.ya?ml$|^infra\/|^infrastructure\/|deploy|deployment)/)
  }
];

function bySignal(context: RuleContext, key: string): string[] {
  return context.signalFiles.get(key) ?? [];
}

function byFilename(context: RuleContext, filenames: string[]): string[] {
  const wanted = new Set(filenames.map((file) => file.toLowerCase()));

  return context.files.filter((file) => wanted.has(file.toLowerCase().split("/").at(-1) ?? file));
}

function byPathPattern(context: RuleContext, pattern: RegExp): string[] {
  return context.files.filter((file) => pattern.test(file.toLowerCase()));
}

function workflowByName(context: RuleContext, pattern: RegExp): string[] {
  return context.files.filter(
    (file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file) && pattern.test(file)
  );
}

function byContentCheck(context: RuleContext, keys: string[]): string[] {
  return keys.flatMap((key) => {
    const check = context.contentChecks.get(key);

    return check?.status === "passed" ? check.evidence : [];
  });
}

function deepEvidence(
  context: RuleContext,
  kinds: RepositoryContentFileKind[],
  keys: string[]
): string[] {
  return kinds.some((kind) => context.analyzedContentKinds.has(kind))
    ? byContentCheck(context, keys)
    : [];
}

function deepOrFallback(
  context: RuleContext,
  kinds: RepositoryContentFileKind[],
  keys: string[],
  fallback: () => string[]
): string[] {
  return kinds.some((kind) => context.analyzedContentKinds.has(kind))
    ? byContentCheck(context, keys)
    : fallback();
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
