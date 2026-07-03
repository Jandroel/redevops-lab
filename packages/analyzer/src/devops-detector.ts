import type { DevOpsSignal, DevOpsSignalCategory, RepoTreeItem } from "@redevops-lab/shared";

interface SignalDefinition {
  key: string;
  label: string;
  category: DevOpsSignalCategory;
  confidence: number;
  descriptionDetected: string;
  descriptionMissing: string;
  match(path: string): boolean;
}

const definitions: SignalDefinition[] = [
  {
    key: "dockerfile",
    label: "Dockerfile",
    category: "containerization",
    confidence: 0.95,
    descriptionDetected: "A Dockerfile was found, which indicates the project can be containerized.",
    descriptionMissing: "No Dockerfile was found, so containerization is not explicit yet.",
    match: (path) => filename(path) === "dockerfile" || filename(path).endsWith(".dockerfile")
  },
  {
    key: "docker_compose",
    label: "Docker Compose",
    category: "containerization",
    confidence: 0.9,
    descriptionDetected: "A Compose file was found for local multi-service development.",
    descriptionMissing: "No Docker Compose file was found for local service orchestration.",
    match: (path) =>
      ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"].includes(filename(path))
  },
  {
    key: "dockerignore",
    label: ".dockerignore",
    category: "containerization",
    confidence: 0.75,
    descriptionDetected: "A .dockerignore file was found to keep Docker build context lean.",
    descriptionMissing: "No .dockerignore file was found.",
    match: (path) => filename(path) === ".dockerignore"
  },
  {
    key: "github_actions",
    label: "GitHub Actions",
    category: "ci_cd",
    confidence: 0.95,
    descriptionDetected: "GitHub Actions workflows were found.",
    descriptionMissing: "No GitHub Actions workflow was found.",
    match: (path) => /^\.github\/workflows\/.+\.ya?ml$/i.test(path)
  },
  {
    key: "external_ci",
    label: "External CI/CD",
    category: "ci_cd",
    confidence: 0.85,
    descriptionDetected: "A CI/CD configuration file was found.",
    descriptionMissing: "No Jenkins, GitLab CI, Azure Pipelines, or CircleCI config was found.",
    match: (path) =>
      [
        ".gitlab-ci.yml",
        "jenkinsfile",
        "azure-pipelines.yml",
        ".circleci/config.yml"
      ].includes(path.toLowerCase())
  },
  {
    key: "env_example",
    label: "Environment example",
    category: "configuration",
    confidence: 0.9,
    descriptionDetected: "An environment example file documents required runtime variables.",
    descriptionMissing: "No .env.example or .env.sample file was found.",
    match: (path) => [".env.example", ".env.sample"].includes(filename(path))
  },
  {
    key: "config_directory",
    label: "Configuration directory",
    category: "configuration",
    confidence: 0.55,
    descriptionDetected: "A config directory was found.",
    descriptionMissing: "No top-level config directory was found.",
    match: (path) => path.toLowerCase().startsWith("config/")
  },
  {
    key: "dependency_scanning",
    label: "Dependency scanning",
    category: "security",
    confidence: 0.85,
    descriptionDetected: "Dependency or code scanning configuration was found.",
    descriptionMissing: "No Dependabot, CodeQL, Snyk, Trivy, Gitleaks, or Semgrep signal was found.",
    match: (path) => {
      const normalized = path.toLowerCase();
      return (
        normalized.endsWith("dependabot.yml") ||
        normalized.endsWith("dependabot.yaml") ||
        normalized.endsWith("codeql.yml") ||
        normalized.endsWith("codeql.yaml") ||
        normalized.includes("snyk") ||
        normalized.includes("trivy") ||
        normalized.includes("gitleaks") ||
        normalized.includes("semgrep")
      );
    }
  },
  {
    key: "security_docs",
    label: "Security documentation",
    category: "security",
    confidence: 0.75,
    descriptionDetected: "Security documentation was found.",
    descriptionMissing: "No SECURITY.md file was found.",
    match: (path) => filename(path) === "security.md"
  },
  {
    key: "observability",
    label: "Observability",
    category: "observability",
    confidence: 0.65,
    descriptionDetected: "Observability-related files or naming were found.",
    descriptionMissing: "No obvious observability signals were found.",
    match: (path) => {
      const normalized = path.toLowerCase();
      return (
        normalized.endsWith("prometheus.yml") ||
        normalized.endsWith("prometheus.yaml") ||
        normalized.startsWith("grafana/") ||
        normalized.includes("opentelemetry") ||
        normalized.includes("otel") ||
        normalized.includes("logging") ||
        normalized.includes("logger") ||
        normalized.includes("metrics") ||
        normalized.includes("health")
      );
    }
  },
  {
    key: "terraform",
    label: "Terraform",
    category: "infrastructure",
    confidence: 0.9,
    descriptionDetected: "Terraform files were found.",
    descriptionMissing: "No Terraform files were found.",
    match: (path) => path.toLowerCase().startsWith("terraform/") || path.toLowerCase().endsWith(".tf")
  },
  {
    key: "serverless",
    label: "Serverless config",
    category: "deployment",
    confidence: 0.75,
    descriptionDetected: "Serverless deployment configuration was found.",
    descriptionMissing: "No serverless.yml file was found.",
    match: (path) => ["serverless.yml", "serverless.yaml"].includes(filename(path))
  },
  {
    key: "kubernetes",
    label: "Kubernetes manifests",
    category: "deployment",
    confidence: 0.86,
    descriptionDetected: "Kubernetes or Helm deployment files were found.",
    descriptionMissing: "No Kubernetes or Helm deployment files were found.",
    match: (path) => {
      const normalized = path.toLowerCase();
      return (
        normalized.startsWith("k8s/") ||
        normalized.startsWith("kubernetes/") ||
        normalized.startsWith("helm/") ||
        filename(normalized) === "chart.yaml" ||
        ["deployment.yaml", "service.yaml", "ingress.yaml"].includes(filename(normalized))
      );
    }
  },
  {
    key: "readme",
    label: "README",
    category: "documentation",
    confidence: 0.95,
    descriptionDetected: "A README file was found.",
    descriptionMissing: "No README.md file was found.",
    match: (path) => filename(path) === "readme.md"
  },
  {
    key: "deployment_docs",
    label: "Deployment documentation",
    category: "documentation",
    confidence: 0.82,
    descriptionDetected: "Deployment documentation was found.",
    descriptionMissing: "No deployment documentation was found.",
    match: (path) => {
      const normalized = path.toLowerCase();
      return filename(normalized) === "deployment.md" || normalized.includes("deploy");
    }
  },
  {
    key: "docs_directory",
    label: "Documentation directory",
    category: "documentation",
    confidence: 0.75,
    descriptionDetected: "A docs directory was found.",
    descriptionMissing: "No docs directory was found.",
    match: (path) => path.toLowerCase().startsWith("docs/")
  }
];

export function detectDevOpsSignals(tree: RepoTreeItem[]): DevOpsSignal[] {
  const filePaths = tree.filter((item) => item.type === "file").map((item) => item.path);

  return definitions.map((definition) => {
    const files = filePaths.filter((path) => definition.match(path)).sort((a, b) => a.localeCompare(b));
    const detected = files.length > 0;

    return {
      key: definition.key,
      label: definition.label,
      category: definition.category,
      detected,
      confidence: detected ? definition.confidence : 0,
      files: files.slice(0, 12),
      description: detected ? definition.descriptionDetected : definition.descriptionMissing
    };
  });
}

function filename(path: string): string {
  return path.toLowerCase().split("/").at(-1) ?? path.toLowerCase();
}
