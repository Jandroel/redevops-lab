import { analyzeRepositoryContents, parseGitHubUrl } from "@redevops-lab/analyzer";
import {
  generateDevOpsConcepts,
  generateGuidedLearningMissions,
  generateHandsOnLabs,
  generateLearningPath,
  generateLearningModules,
  generateProductionChecklist,
  generateRecommendedNextSteps
} from "@redevops-lab/learning";
import { calculateDevOpsScore } from "@redevops-lab/scoring";
import type {
  DetectedStackItem,
  DevOpsFinding,
  DevOpsReport,
  DevOpsScoreSummary,
  DevOpsSignal,
  LearningPathStep,
  ProductionChecklistItem,
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
    description:
      "The project has local service orchestration, but production images are not defined yet.",
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
    description:
      "The next valuable step is dependency scanning plus richer logs, metrics, or tracing.",
    severity: "medium"
  }
];

export const demoRepositoryInput: RepositoryInput = {
  url: "https://github.com/Jandroel/redevops-lab",
  level: "beginner",
  language: "es"
};

const demoContentFiles = [
  {
    path: "package.json",
    kind: "package_json" as const,
    content: JSON.stringify({
      packageManager: "pnpm@11.9.0",
      scripts: {
        build: "pnpm build:packages",
        lint: "pnpm -r lint",
        typecheck: "pnpm -r typecheck"
      }
    }),
    size: 160,
    truncated: false
  },
  {
    path: ".github/workflows/ci.yml",
    kind: "workflow" as const,
    content:
      "name: CI\non:\n  pull_request:\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm lint\n      - run: pnpm typecheck\n      - run: pnpm build\n",
    size: 170,
    truncated: false
  },
  {
    path: ".env.example",
    kind: "env_example" as const,
    content: "PORT=3001\nGITHUB_TOKEN=\n",
    size: 28,
    truncated: false
  },
  {
    path: "README.md",
    kind: "readme" as const,
    content:
      "# ReDevOps Lab\n## Installation\npnpm install\n## Configuration\nUse .env.example\n## Testing\npnpm test\n## Architecture\nSee docs.\n## Troubleshooting\nCheck API logs.\n",
    size: 168,
    truncated: false
  },
  {
    path: "docker-compose.yml",
    kind: "compose" as const,
    content:
      "services:\n  postgres:\n    image: postgres:16\n    env_file: .env\n    healthcheck:\n      test: pg_isready\n",
    size: 110,
    truncated: false
  }
];

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
    contentAnalysis: analyzeRepositoryContents({
      files: demoContentFiles,
      selection: {
        files: demoContentFiles.map(({ path, kind, size }) => ({ path, kind, size })),
        candidateFiles: demoContentFiles.length,
        skippedLargeFiles: 0,
        maxFiles: 10,
        maxFileBytes: 96_000,
        maxTotalBytes: 480_000
      }
    }),
    generatedAt,
    warnings: ["Demo report uses local mock analysis data."],
    treeStats: {
      totalItems: 8,
      analyzedItems: 8,
      truncated: false
    }
  };
  const learning = createLearningSections(input, analysis);

  return {
    id,
    repository: analysis.repository,
    input: {
      ...input,
      url: repository.url
    },
    score: learning.score,
    detectedStack,
    findings,
    productionChecklist: learning.productionChecklist,
    learningPath: learning.learningPath,
    labs: learning.labs,
    concepts: learning.concepts,
    learningModules: learning.learningModules,
    guidedMissions: learning.guidedMissions,
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
  const learning = createLearningSections(input, analysis);

  return {
    id,
    repository: analysis.repository,
    input: {
      ...input,
      url: analysis.repository.url
    },
    score: learning.score,
    detectedStack: analysis.detectedStack,
    findings: analysisFindings,
    productionChecklist: learning.productionChecklist,
    learningPath: learning.learningPath,
    labs: learning.labs,
    concepts: learning.concepts,
    learningModules: learning.learningModules,
    guidedMissions: learning.guidedMissions,
    analysis,
    generatedAt: analysis.generatedAt
  };
}

export function createDemoReport(): DevOpsReport {
  return createMockDevOpsReport(demoRepositoryInput);
}

function createLearningSections(
  input: RepositoryInput,
  analysis: RepositoryAnalysis
): {
  score: DevOpsScoreSummary;
  productionChecklist: ProductionChecklistItem[];
  learningPath: LearningPathStep[];
  labs: DevOpsReport["labs"];
  concepts: NonNullable<DevOpsReport["concepts"]>;
  learningModules: NonNullable<DevOpsReport["learningModules"]>;
  guidedMissions: NonNullable<DevOpsReport["guidedMissions"]>;
} {
  const score = calculateDevOpsScore(analysis);
  const productionChecklist = generateProductionChecklist({
    analysis,
    score,
    level: input.level,
    language: input.language
  });
  const learningPath = generateLearningPath({
    analysis,
    score,
    checklist: productionChecklist,
    level: input.level,
    language: input.language
  });
  const labs = generateHandsOnLabs({
    analysis,
    score,
    checklist: productionChecklist,
    learningPath,
    level: input.level,
    language: input.language
  });
  const concepts = generateDevOpsConcepts({
    analysis,
    score,
    checklist: productionChecklist,
    learningPath,
    labs,
    language: input.language
  });
  const learningModules = generateLearningModules({
    checklist: productionChecklist,
    learningPath,
    labs,
    concepts,
    level: input.level,
    language: input.language
  });
  const guidedMissions = generateGuidedLearningMissions({
    analysis,
    checklist: productionChecklist,
    modules: learningModules,
    labs,
    concepts,
    level: input.level,
    language: input.language
  });
  const nextBestActions = generateRecommendedNextSteps({
    score,
    checklist: productionChecklist,
    learningPath,
    level: input.level,
    language: input.language
  });

  return {
    score: {
      ...score,
      nextBestActions
    },
    productionChecklist,
    learningPath,
    labs,
    concepts,
    learningModules,
    guidedMissions
  };
}
