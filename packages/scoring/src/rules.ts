import type {
  DevOpsScoreCategoryKey,
  DevOpsScoreRule,
  FindingSeverity,
  RepositoryAnalysis
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
    description: "A Dockerfile indicates that the application can be packaged as a container image.",
    maxPoints: 8,
    recommendation: "Add a Dockerfile or document the container image build strategy.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "dockerfile")
  },
  {
    id: "containerization.dockerignore",
    category: "containerization",
    title: ".dockerignore detected",
    description: "A .dockerignore keeps the Docker build context small and avoids copying secrets.",
    maxPoints: 5,
    recommendation: "Add .dockerignore to keep local files, dependencies, and secrets out of images.",
    severity: "medium",
    evidence: (_analysis, context) => byFilename(context, [".dockerignore"])
  },
  {
    id: "containerization.compose",
    category: "containerization",
    title: "Docker Compose detected",
    description: "Compose files help developers run multi-service environments locally.",
    maxPoints: 5,
    recommendation: "Add docker-compose.yml for local dependencies and repeatable development setup.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "docker_compose")
  },
  {
    id: "containerization.multiple",
    category: "containerization",
    title: "Multiple container artifacts detected",
    description: "Multiple container artifacts suggest a more complete containerization setup.",
    maxPoints: 2,
    recommendation: "Add both image build and local orchestration artifacts for a complete container workflow.",
    severity: "low",
    evidence: (_analysis, context) => {
      const artifacts = unique([
        ...bySignal(context, "dockerfile"),
        ...bySignal(context, "docker_compose"),
        ...byFilename(context, [".dockerignore"])
      ]);

      return artifacts.length >= 2 ? artifacts : [];
    }
  },
  {
    id: "ci_cd.pipeline",
    category: "ci_cd",
    title: "CI/CD pipeline detected",
    description: "A CI/CD pipeline validates changes and creates the foundation for automated delivery.",
    maxPoints: 10,
    recommendation: "Add GitHub Actions or another CI system for pull request validation.",
    severity: "high",
    evidence: (_analysis, context) => unique([...bySignal(context, "github_actions"), ...bySignal(context, "external_ci")])
  },
  {
    id: "ci_cd.tests",
    category: "ci_cd",
    title: "Test workflow probable",
    description: "Workflow names suggest tests or checks run automatically.",
    maxPoints: 4,
    recommendation: "Add a test workflow that runs on every pull request.",
    severity: "medium",
    evidence: (_analysis, context) => workflowByName(context, /(test|check|quality|ci)/)
  },
  {
    id: "ci_cd.build",
    category: "ci_cd",
    title: "Build workflow probable",
    description: "Workflow names suggest build validation is automated.",
    maxPoints: 3,
    recommendation: "Add a build job to the CI pipeline.",
    severity: "medium",
    evidence: (_analysis, context) => workflowByName(context, /(build|ci)/)
  },
  {
    id: "ci_cd.deploy",
    category: "ci_cd",
    title: "Deploy or release workflow probable",
    description: "Workflow names suggest deployment or release automation exists.",
    maxPoints: 3,
    recommendation: "Add a deploy or release workflow once the project is production-ready.",
    severity: "low",
    evidence: (_analysis, context) => workflowByName(context, /(deploy|release|publish)/)
  },
  {
    id: "configuration.env_example",
    category: "configuration",
    title: "Environment example detected",
    description: "An example environment file documents required runtime configuration.",
    maxPoints: 6,
    recommendation: "Add .env.example or .env.sample with all required variables.",
    severity: "medium",
    evidence: (_analysis, context) => bySignal(context, "env_example")
  },
  {
    id: "configuration.docs",
    category: "configuration",
    title: "Configuration documentation inferred",
    description: "README or docs exist alongside configuration artifacts.",
    maxPoints: 3,
    recommendation: "Document configuration in README or docs.",
    severity: "low",
    evidence: (_analysis, context) => {
      const docs = unique([...bySignal(context, "readme"), ...bySignal(context, "docs_directory")]);
      const config = unique([...bySignal(context, "env_example"), ...bySignal(context, "config_directory")]);

      return docs.length > 0 && config.length > 0 ? docs.slice(0, 3) : [];
    }
  },
  {
    id: "configuration.config_directory",
    category: "configuration",
    title: "Configuration directory detected",
    description: "A config directory indicates configuration is separated from application code.",
    maxPoints: 3,
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
      byPathPattern(context, /(docker-compose\.override|\.env\.|environment|environments|deployment|config\/.*env)/)
  },
  {
    id: "security.dependabot",
    category: "security",
    title: "Dependabot detected",
    description: "Dependabot automates dependency update checks.",
    maxPoints: 5,
    recommendation: "Add .github/dependabot.yml for dependency update automation.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(^|\/)dependabot\.ya?ml$/)
  },
  {
    id: "security.codeql",
    category: "security",
    title: "CodeQL detected",
    description: "CodeQL or equivalent code scanning helps catch security issues in CI.",
    maxPoints: 4,
    recommendation: "Add CodeQL or another static analysis workflow.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /codeql\.ya?ml$/)
  },
  {
    id: "security.scanning",
    category: "security",
    title: "Security scanner detected",
    description: "Snyk, Trivy, Semgrep, or Gitleaks signals indicate additional security scanning.",
    maxPoints: 3,
    recommendation: "Add Snyk, Trivy, Semgrep, or Gitleaks to CI.",
    severity: "medium",
    evidence: (_analysis, context) => byPathPattern(context, /(snyk|trivy|semgrep|gitleaks)/)
  },
  {
    id: "security.policy",
    category: "security",
    title: "Security policy detected",
    description: "SECURITY.md documents how to report vulnerabilities.",
    maxPoints: 3,
    recommendation: "Add SECURITY.md with vulnerability reporting guidance.",
    severity: "low",
    evidence: (_analysis, context) => bySignal(context, "security_docs")
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
    maxPoints: 3,
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
    evidence: (_analysis, context) => bySignal(context, "deployment_docs")
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
    id: "documentation.changelog",
    category: "documentation",
    title: "Changelog detected",
    description: "CHANGELOG.md records release and change history.",
    maxPoints: 1,
    recommendation: "Add CHANGELOG.md once release history starts.",
    severity: "low",
    evidence: (_analysis, context) => byFilename(context, ["changelog.md"])
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

      return files.length > 0 ? files : analysis.repository.license ? [analysis.repository.license] : [];
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
    recommendation: "Add Kubernetes manifests when orchestration becomes part of the deployment target.",
    severity: "low",
    evidence: (_analysis, context) => byPathPattern(context, /(^k8s\/|^kubernetes\/|deployment\.ya?ml$|service\.ya?ml$|ingress\.ya?ml$)/)
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
    evidence: (_analysis, context) => byPathPattern(context, /(serverless\.ya?ml$|^infra\/|^infrastructure\/|deploy|deployment)/)
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
  return context.files.filter((file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file) && pattern.test(file));
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
