import { parseGitHubUrl } from "@redevops-lab/analyzer";
import { calculateDevOpsScore } from "@redevops-lab/scoring";
import type {
  DetectedStackItem,
  DevOpsFinding,
  DevOpsLab,
  DevOpsReport,
  DevOpsSignal,
  LearningPathStep,
  RepositoryAnalysis,
  RepositoryInput
} from "@redevops-lab/shared";

const detectedStack: DetectedStackItem[] = [
  { name: "Next.js", category: "frontend", confidence: 0.92 },
  { name: "NestJS", category: "backend", confidence: 0.9 },
  { name: "TypeScript", category: "language", confidence: 0.98 },
  { name: "PostgreSQL", category: "database", confidence: 0.62 },
  { name: "Docker", category: "devops", confidence: 0.74 }
];

const devopsSignals: DevOpsSignal[] = [
  {
    key: "dockerfile",
    label: "Dockerfile",
    category: "containerization",
    detected: false,
    confidence: 0,
    files: [],
    description: "No Dockerfile was found in the demo baseline."
  },
  {
    key: "docker_compose",
    label: "Docker Compose",
    category: "containerization",
    detected: true,
    confidence: 0.9,
    files: ["docker-compose.yml"],
    description: "A Docker Compose file is present for local development services."
  },
  {
    key: "github_actions",
    label: "GitHub Actions",
    category: "ci_cd",
    detected: true,
    confidence: 0.95,
    files: [".github/workflows/ci.yml"],
    description: "A GitHub Actions workflow is present in the scaffold."
  },
  {
    key: "env_example",
    label: "Environment example",
    category: "configuration",
    detected: true,
    confidence: 0.9,
    files: [".env.example"],
    description: "An environment example file documents planned runtime variables."
  },
  {
    key: "dependency_scanning",
    label: "Dependency scanning",
    category: "security",
    detected: false,
    confidence: 0,
    files: [],
    description: "No security scanning workflow is present yet."
  },
  {
    key: "observability",
    label: "Observability",
    category: "observability",
    detected: true,
    confidence: 0.55,
    files: ["apps/api/src/modules/health/health.controller.ts"],
    description: "A health endpoint exists, but metrics and tracing are still future work."
  },
  {
    key: "deployment_docs",
    label: "Deployment documentation",
    category: "documentation",
    detected: true,
    confidence: 0.82,
    files: ["docs/deployment.md"],
    description: "Deployment documentation exists for the current scaffold."
  },
  {
    key: "readme",
    label: "README",
    category: "documentation",
    detected: true,
    confidence: 0.95,
    files: ["README.md"],
    description: "A README file exists."
  },
  {
    key: "docs_directory",
    label: "Documentation directory",
    category: "documentation",
    detected: true,
    confidence: 0.75,
    files: ["docs/deployment.md"],
    description: "A docs directory exists."
  }
];

const findings: DevOpsFinding[] = [
  {
    type: "strength",
    title: "Monorepo structure",
    description: "The repository separates web, API, and reusable packages into clear workspaces.",
    severity: "low"
  },
  {
    type: "strength",
    title: "Basic API health endpoint",
    description: "The backend exposes a health endpoint that deployment platforms can probe.",
    severity: "low"
  },
  {
    type: "missing",
    title: "Production Docker setup",
    description: "The project has local service orchestration, but production images are not defined yet.",
    severity: "medium"
  },
  {
    type: "missing",
    title: "Security scanning",
    description: "Dependency and secret scanning should be added to CI before production use.",
    severity: "high"
  },
  {
    type: "risk",
    title: "Observability is thin",
    description: "Health checks exist, but logs, metrics, and traces are not structured yet.",
    severity: "medium"
  },
  {
    type: "recommendation",
    title: "Add security scanning and observability depth",
    description: "The next valuable step is dependency scanning plus richer logs, metrics, or tracing.",
    severity: "medium"
  }
];

const labs: DevOpsLab[] = [
  {
    id: "lab-docker-compose",
    title: "Add Docker Compose",
    difficulty: "beginner",
    objective: "Run future infrastructure dependencies locally with repeatable commands.",
    suggestedFiles: ["docker-compose.yml", ".env.example"],
    validation: "docker compose config validates and PostgreSQL starts locally.",
    estimatedTime: "25 min"
  },
  {
    id: "lab-github-actions-ci",
    title: "Create GitHub Actions CI",
    difficulty: "intermediate",
    objective: "Validate install, lint, typecheck, and build on every pull request.",
    suggestedFiles: [".github/workflows/ci.yml", "package.json"],
    validation: "A pull request runs install, lint, typecheck, and build jobs successfully.",
    estimatedTime: "35 min"
  },
  {
    id: "lab-health-checks",
    title: "Add Health Checks",
    difficulty: "beginner",
    objective: "Expose predictable health responses for uptime checks and deploy platforms.",
    suggestedFiles: ["apps/api/src/modules/health"],
    validation: "GET /api/health returns service, version, environment, and timestamp.",
    estimatedTime: "20 min"
  },
  {
    id: "lab-security-scanning",
    title: "Add Security Scanning",
    difficulty: "intermediate",
    objective: "Detect vulnerable dependencies before changes reach production.",
    suggestedFiles: [".github/workflows/security.yml"],
    validation: "Security scan results are visible on pull requests.",
    estimatedTime: "40 min"
  },
  {
    id: "lab-deployment-docs",
    title: "Document Deployment",
    difficulty: "beginner",
    objective: "Make Vercel and Railway deployment steps reproducible for contributors.",
    suggestedFiles: ["docs/deployment.md", "README.md"],
    validation: "A new contributor can deploy web and API by following the docs.",
    estimatedTime: "30 min"
  }
];

const learningPath: LearningPathStep[] = [
  {
    id: "path-env",
    title: "Document runtime configuration",
    description: "Clarify the environment variables required by web, API, and future services.",
    topics: ["configuration", "secret hygiene"],
    labs: ["lab-docker-compose"]
  },
  {
    id: "path-ci",
    title: "Automate verification",
    description: "Create a CI workflow that catches regressions before merge.",
    topics: ["ci", "quality gates"],
    labs: ["lab-github-actions-ci"]
  },
  {
    id: "path-operability",
    title: "Add operational readiness signals",
    description: "Expose health information and prepare the app for deploy platform checks.",
    topics: ["health checks", "observability"],
    labs: ["lab-health-checks"]
  },
  {
    id: "path-security",
    title: "Add security baseline",
    description: "Introduce dependency scanning and document what risks remain.",
    topics: ["supply chain", "dependency scanning"],
    labs: ["lab-security-scanning"]
  },
  {
    id: "path-deploy",
    title: "Document deployment",
    description: "Write the first deployment guide for Vercel, Railway, and future PostgreSQL.",
    topics: ["deployment", "runbooks"],
    labs: ["lab-deployment-docs"]
  }
];

export const demoRepositoryInput: RepositoryInput = {
  url: "https://github.com/Jandroel/redevops-lab",
  level: "beginner",
  language: "es"
};

export function createMockDevOpsReport(input: RepositoryInput): DevOpsReport {
  const repository = parseGitHubUrl(input.url);

  if (!repository) {
    throw new Error("Invalid GitHub repository URL.");
  }

  const id = `demo-${repository.owner.toLowerCase()}-${repository.repo.toLowerCase()}`;
  const generatedAt = new Date().toISOString();
  const analysis: RepositoryAnalysis = {
    repository: {
      provider: "github",
      owner: repository.owner,
      name: repository.repo,
      fullName: repository.fullName,
      url: repository.url,
      defaultBranch: "main",
      license: "MIT",
      isPrivate: false
    },
    tree: [
      { path: ".env.example", type: "file", extension: ".example" },
      { path: ".github/workflows/ci.yml", type: "file", extension: ".yml" },
      { path: "README.md", type: "file", extension: ".md" },
      { path: "apps/api/src/modules/health/health.controller.ts", type: "file", extension: ".ts" },
      { path: "docker-compose.yml", type: "file", extension: ".yml" },
      { path: "docs/deployment.md", type: "file", extension: ".md" },
      { path: "LICENSE", type: "file" },
      { path: "package.json", type: "file", extension: ".json" }
    ],
    importantFiles: [
      ".env.example",
      ".github/workflows/ci.yml",
      "README.md",
      "apps/api/src/modules/health/health.controller.ts",
      "docker-compose.yml",
      "docs/deployment.md",
      "LICENSE",
      "package.json"
    ],
    devopsSignals,
    detectedStack,
    generatedAt,
    warnings: ["Demo report uses local mock analysis data."],
    treeStats: {
      totalItems: 8,
      analyzedItems: 8,
      truncated: false
    }
  };

  return {
    id,
    repository: analysis.repository,
    input: {
      ...input,
      url: repository.url
    },
    score: calculateDevOpsScore(analysis),
    detectedStack,
    findings,
    learningPath,
    labs,
    analysis,
    generatedAt
  };
}

export function createAnalyzedDevOpsReport(
  input: RepositoryInput,
  analysis: RepositoryAnalysis,
  analysisFindings: DevOpsFinding[]
): DevOpsReport {
  const id = `analysis-${analysis.repository.owner.toLowerCase()}-${analysis.repository.name.toLowerCase()}-${Date.now()}`;

  return {
    id,
    repository: analysis.repository,
    input: {
      ...input,
      url: analysis.repository.url
    },
    score: calculateDevOpsScore(analysis),
    detectedStack: analysis.detectedStack,
    findings: analysisFindings,
    learningPath,
    labs,
    analysis,
    generatedAt: analysis.generatedAt
  };
}

export function createDemoReport(): DevOpsReport {
  return createMockDevOpsReport(demoRepositoryInput);
}
