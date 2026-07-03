import type { DevOpsReport } from "@redevops-lab/shared";

const fallbackScoreCategories: DevOpsReport["score"]["categories"] = [
  {
    key: "containerization",
    name: "Containerization",
    score: 5,
    maxScore: 20,
    percentage: 25,
    summary: "Containerization needs attention, but Docker Compose is available for local services.",
    rules: [
      createRule("containerization.dockerfile", "containerization", "Dockerfile detected", 0, 8, []),
      createRule("containerization.dockerignore", "containerization", ".dockerignore detected", 0, 5, []),
      createRule("containerization.compose", "containerization", "Docker Compose detected", 5, 5, ["docker-compose.yml"]),
      createRule("containerization.multiple", "containerization", "Multiple container artifacts detected", 0, 2, [])
    ]
  },
  {
    key: "ci_cd",
    name: "CI/CD",
    score: 17,
    maxScore: 20,
    percentage: 85,
    summary: "CI/CD is strong based on workflow naming signals.",
    rules: [
      createRule("ci_cd.pipeline", "ci_cd", "CI/CD pipeline detected", 10, 10, [".github/workflows/ci.yml"]),
      createRule("ci_cd.tests", "ci_cd", "Test workflow probable", 4, 4, [".github/workflows/ci.yml"]),
      createRule("ci_cd.build", "ci_cd", "Build workflow probable", 3, 3, [".github/workflows/ci.yml"]),
      createRule("ci_cd.deploy", "ci_cd", "Deploy or release workflow probable", 0, 3, [])
    ]
  },
  {
    key: "configuration",
    name: "Configuration",
    score: 9,
    maxScore: 15,
    percentage: 60,
    summary: "Configuration readiness is developing based on environment examples and docs.",
    rules: [
      createRule("configuration.env_example", "configuration", "Environment example detected", 6, 6, [".env.example"]),
      createRule("configuration.docs", "configuration", "Configuration documentation inferred", 3, 3, ["README.md"]),
      createRule("configuration.config_directory", "configuration", "Configuration directory detected", 0, 3, []),
      createRule("configuration.environments", "configuration", "Environment separation inferred", 0, 3, [])
    ]
  },
  {
    key: "security",
    name: "Security",
    score: 0,
    maxScore: 15,
    percentage: 0,
    summary: "Security automation needs attention based on missing scanning and policy signals.",
    rules: [
      createRule("security.dependabot", "security", "Dependabot detected", 0, 5, []),
      createRule("security.codeql", "security", "CodeQL detected", 0, 4, []),
      createRule("security.scanning", "security", "Security scanner detected", 0, 3, []),
      createRule("security.policy", "security", "Security policy detected", 0, 3, [])
    ]
  },
  {
    key: "observability",
    name: "Observability",
    score: 3,
    maxScore: 10,
    percentage: 30,
    summary: "Observability needs attention based on health-only signals.",
    rules: [
      createRule("observability.health", "observability", "Health check signal detected", 3, 3, ["apps/api/src/modules/health/health.controller.ts"]),
      createRule("observability.logging", "observability", "Logging signal detected", 0, 3, []),
      createRule("observability.metrics", "observability", "Metrics or Prometheus detected", 0, 2, []),
      createRule("observability.tracing", "observability", "Tracing or dashboard signal detected", 0, 2, [])
    ]
  },
  {
    key: "documentation",
    name: "Documentation",
    score: 8,
    maxScore: 10,
    percentage: 80,
    summary: "Documentation is strong based on README, docs, deployment, and license files.",
    rules: [
      createRule("documentation.readme", "documentation", "README detected", 3, 3, ["README.md"]),
      createRule("documentation.docs", "documentation", "Docs directory detected", 2, 2, ["docs/deployment.md"]),
      createRule("documentation.deployment", "documentation", "Deployment documentation detected", 2, 2, ["docs/deployment.md"]),
      createRule("documentation.contributing", "documentation", "Contributing guide detected", 0, 1, []),
      createRule("documentation.changelog", "documentation", "Changelog detected", 0, 1, []),
      createRule("documentation.license", "documentation", "License detected", 1, 1, ["MIT"])
    ]
  },
  {
    key: "infrastructure",
    name: "Infrastructure",
    score: 1,
    maxScore: 10,
    percentage: 10,
    summary: "Infrastructure readiness needs attention based on missing IaC and orchestration signals.",
    rules: [
      createRule("infrastructure.iac", "infrastructure", "Infrastructure as Code detected", 0, 4, []),
      createRule("infrastructure.kubernetes", "infrastructure", "Kubernetes manifests detected", 0, 3, []),
      createRule("infrastructure.helm", "infrastructure", "Helm chart detected", 0, 2, []),
      createRule("infrastructure.deployment_config", "infrastructure", "Deployment or infra config detected", 1, 1, ["docs/deployment.md"])
    ]
  }
];

function createRule(
  id: DevOpsReport["score"]["categories"][number]["rules"][number]["id"],
  category: DevOpsReport["score"]["categories"][number]["key"],
  title: string,
  points: number,
  maxPoints: number,
  evidence: string[]
): DevOpsReport["score"]["categories"][number]["rules"][number] {
  return {
    id,
    category,
    title,
    description: title,
    points,
    maxPoints,
    passed: points > 0,
    evidence,
    recommendation: points > 0 ? undefined : `Add evidence for: ${title}.`,
    severity: points > 0 ? undefined : "medium"
  };
}

export const demoReport: DevOpsReport = {
  id: "demo-jandroel-redevops-lab",
  repository: {
    provider: "github",
    owner: "Jandroel",
    name: "redevops-lab",
    fullName: "Jandroel/redevops-lab",
    url: "https://github.com/Jandroel/redevops-lab",
    defaultBranch: "main"
  },
  input: {
    url: "https://github.com/Jandroel/redevops-lab",
    level: "beginner",
    language: "es"
  },
  score: {
    total: 43,
    maxScore: 100,
    percentage: 43,
    maturityLevel: "Foundation",
    categories: fallbackScoreCategories,
    strengths: [
      "CI/CD pipeline detected (+10)",
      "Environment example detected (+6)",
      "README detected (+3)",
      "Deployment documentation detected (+2)"
    ],
    weaknesses: [
      "Containerization is below 50% (5/20).",
      "Security is below 50% (0/15).",
      "Infrastructure is below 50% (1/10)."
    ],
    nextBestActions: [
      "Add a Dockerfile or document the container image build strategy.",
      "Add .github/dependabot.yml for dependency update automation.",
      "Add structured logging guidance and runtime log conventions."
    ]
  },
  detectedStack: [
    { name: "Next.js", category: "frontend", confidence: 0.92 },
    { name: "NestJS", category: "backend", confidence: 0.9 },
    { name: "TypeScript", category: "language", confidence: 0.98 },
    { name: "PostgreSQL", category: "database", confidence: 0.62 },
    { name: "Docker", category: "devops", confidence: 0.74 }
  ],
  findings: [
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
  ],
  learningPath: [
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
  ],
  labs: [
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
  ],
  analysis: {
    repository: {
      provider: "github",
      owner: "Jandroel",
      name: "redevops-lab",
      fullName: "Jandroel/redevops-lab",
      url: "https://github.com/Jandroel/redevops-lab",
      defaultBranch: "main",
      stars: 0,
      forks: 0,
      openIssues: 0,
      license: "MIT",
      isPrivate: false,
      pushedAt: "2026-07-03T00:00:00.000Z",
      createdAt: "2026-07-03T00:00:00.000Z",
      updatedAt: "2026-07-03T00:00:00.000Z"
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
    devopsSignals: [
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
    ],
    detectedStack: [
      { name: "Next.js", category: "frontend", confidence: 0.92 },
      { name: "NestJS", category: "backend", confidence: 0.9 },
      { name: "TypeScript", category: "language", confidence: 0.98 },
      { name: "PostgreSQL", category: "database", confidence: 0.62 },
      { name: "Docker", category: "devops", confidence: 0.74 }
    ],
    generatedAt: "2026-07-03T00:00:00.000Z",
    warnings: ["Demo report uses local mock analysis data."],
    treeStats: {
      totalItems: 8,
      analyzedItems: 8,
      truncated: false
    }
  },
  generatedAt: "2026-07-03T00:00:00.000Z"
};
