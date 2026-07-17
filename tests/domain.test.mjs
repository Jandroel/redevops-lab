import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchGitHubRepositoryMetadata,
  GitHubAnalyzerError,
  parseGitHubUrl
} from "../packages/analyzer/dist/index.js";
import { calculateDevOpsScore } from "../packages/scoring/dist/index.js";
import {
  generateDevOpsConcepts,
  generateHandsOnLabs,
  generateLearningPath,
  generateLearningModules,
  generateProductionChecklist
} from "../packages/learning/dist/index.js";

test("parseGitHubUrl normalizes repository URLs", () => {
  assert.deepEqual(parseGitHubUrl("github.com/Jandroel/redevops-lab.git"), {
    owner: "Jandroel",
    repo: "redevops-lab",
    fullName: "Jandroel/redevops-lab",
    normalizedUrl: "https://github.com/Jandroel/redevops-lab",
    url: "https://github.com/Jandroel/redevops-lab"
  });

  assert.equal(parseGitHubUrl("https://gitlab.com/Jandroel/redevops-lab"), null);
  assert.equal(parseGitHubUrl("https://github.com/Jandroel"), null);
});

test("GitHub client maps rate limits to a domain error", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
      status: 403,
      headers: {
        "content-type": "application/json",
        "x-ratelimit-remaining": "0"
      }
    });

  try {
    await assert.rejects(
      () => fetchGitHubRepositoryMetadata("Jandroel", "redevops-lab"),
      (error) =>
        error instanceof GitHubAnalyzerError &&
        error.code === "rate_limited" &&
        error.statusCode === 403 &&
        error.message.includes("GITHUB_TOKEN")
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("GitHub client maps aborted requests to timeout errors", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new DOMException("The operation was aborted.", "AbortError");
  };

  try {
    await assert.rejects(
      () => fetchGitHubRepositoryMetadata("Jandroel", "redevops-lab", { timeoutMs: 100 }),
      (error) =>
        error instanceof GitHubAnalyzerError &&
        error.code === "timeout" &&
        error.statusCode === 504
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("scoring and learning engines generate useful deterministic output", () => {
  const analysis = createAnalysisFixture();
  const score = calculateDevOpsScore(analysis);
  const checklist = generateProductionChecklist({
    analysis,
    score,
    level: "beginner",
    language: "en"
  });
  const learningPath = generateLearningPath({
    analysis,
    score,
    checklist,
    level: "beginner",
    language: "en"
  });
  const labs = generateHandsOnLabs({
    analysis,
    score,
    checklist,
    learningPath,
    level: "beginner",
    language: "en"
  });
  const concepts = generateDevOpsConcepts({
    analysis,
    score,
    checklist,
    learningPath,
    labs,
    language: "en"
  });
  const learningModules = generateLearningModules({
    checklist,
    learningPath,
    labs,
    concepts,
    level: "beginner",
    language: "en"
  });

  assert.equal(score.maxScore, 100);
  assert.equal(score.categories.length, 7);
  assert.ok(score.total > 0);
  assert.ok(checklist.length >= 10);
  assert.ok(learningPath.length >= 5);
  assert.ok(labs.length >= 4);
  assert.ok(labs.every((lab) => lab.objective && lab.validation));
  assert.ok(labs.every((lab) => lab.prerequisites?.length && lab.completionCriteria?.length));
  assert.ok(concepts.length >= 4);
  assert.ok(concepts.some((concept) => concept.id === "devops-feedback-loop"));
  assert.ok(learningModules.length >= 3);
  assert.ok(learningModules.every((module) => module.beginnerGoal && module.outcome));
});

function createAnalysisFixture() {
  const files = [
    ".env.example",
    ".github/workflows/ci.yml",
    "README.md",
    "docs/deployment.md",
    "docker-compose.yml",
    "apps/api/src/modules/health/health.controller.ts",
    "package.json"
  ];

  return {
    repository: {
      provider: "github",
      owner: "Jandroel",
      name: "redevops-lab",
      fullName: "Jandroel/redevops-lab",
      url: "https://github.com/Jandroel/redevops-lab",
      defaultBranch: "main",
      isPrivate: false
    },
    tree: files.map((file) => ({
      path: file,
      type: "file",
      extension: file.includes(".") ? `.${file.split(".").at(-1)}` : undefined
    })),
    importantFiles: files,
    detectedStack: [
      { name: "TypeScript", category: "language", confidence: 0.98 },
      { name: "Docker", category: "devops", confidence: 0.74 }
    ],
    devopsSignals: [
      signal("dockerfile", "Dockerfile", "containerization", false, []),
      signal("docker_compose", "Docker Compose", "containerization", true, ["docker-compose.yml"]),
      signal("github_actions", "GitHub Actions", "ci_cd", true, [".github/workflows/ci.yml"]),
      signal("external_ci", "External CI", "ci_cd", false, []),
      signal("env_example", "Environment example", "configuration", true, [".env.example"]),
      signal("config_directory", "Config directory", "configuration", false, []),
      signal("security_docs", "Security docs", "security", false, []),
      signal("readme", "README", "documentation", true, ["README.md"]),
      signal("docs_directory", "Docs directory", "documentation", true, ["docs/deployment.md"]),
      signal("deployment_docs", "Deployment docs", "documentation", true, ["docs/deployment.md"])
    ],
    generatedAt: "2026-07-07T00:00:00.000Z",
    warnings: [],
    treeStats: {
      totalItems: files.length,
      analyzedItems: files.length,
      truncated: false
    }
  };
}

function signal(key, label, category, detected, files) {
  return {
    key,
    label,
    category,
    detected,
    confidence: detected ? 0.9 : 0,
    files,
    description: detected ? `${label} detected.` : `${label} not detected.`
  };
}
