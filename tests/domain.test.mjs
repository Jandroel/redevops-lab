import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeRepositoryContents,
  fetchGitHubRepositoryContents,
  fetchGitHubRepositoryMetadata,
  GitHubAnalyzerError,
  parseGitHubUrl,
  selectRepositoryContentFiles
} from "../packages/analyzer/dist/index.js";
import { calculateDevOpsScore } from "../packages/scoring/dist/index.js";
import {
  generateDevOpsConcepts,
  generateGuidedLearningMissions,
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
        error instanceof GitHubAnalyzerError && error.code === "timeout" && error.statusCode === 504
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("deep content selection stays within safe limits", () => {
  const selection = selectRepositoryContentFiles(
    [
      treeFile("README.md", 1200),
      treeFile(".env.example", 300),
      treeFile("package.json", 900),
      treeFile("apps/web/package.json", 700),
      treeFile(".github/workflows/ci.yml", 1400),
      treeFile("Dockerfile", 600),
      treeFile("large/Dockerfile", 200_000),
      treeFile("src/index.ts", 4000)
    ],
    { maxContentFiles: 5, maxContentFileBytes: 96_000, maxContentBytes: 20_000 }
  );

  assert.equal(selection.files.length, 5);
  assert.ok(selection.files.every((file) => file.path !== "src/index.ts"));
  assert.ok(selection.files.every((file) => file.path !== "large/Dockerfile"));
  assert.equal(selection.skippedLargeFiles, 1);
});

test("deep content analysis confirms practices without exposing env values", () => {
  const files = [
    contentFile(
      "package.json",
      "package_json",
      JSON.stringify({
        packageManager: "pnpm@11.9.0",
        scripts: { test: "node --test", lint: "eslint .", typecheck: "tsc --noEmit", build: "tsc" }
      })
    ),
    contentFile(
      ".github/workflows/quality.yml",
      "workflow",
      `name: Quality\non:\n  pull_request:\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm test\n      - run: pnpm lint\n      - run: pnpm typecheck\n      - run: pnpm build\n      - uses: github/codeql-action/analyze@v3\n`
    ),
    contentFile(
      "Dockerfile",
      "dockerfile",
      "FROM node:24-alpine AS build\nRUN pnpm install --frozen-lockfile\nFROM node:24-alpine\nUSER node\nHEALTHCHECK CMD node health.js\n"
    ),
    contentFile(
      "README.md",
      "readme",
      "# App\n## Installation\npnpm install\n## Configuration\nUse .env.example\n## Testing\npnpm test\n## Deployment\nSee docs.\n## Architecture\nMonorepo.\n## Troubleshooting\nCheck logs."
    ),
    contentFile(
      ".env.example",
      "env_example",
      "GITHUB_TOKEN=real-looking-secret-value\nPORT=3001\n"
    )
  ];
  const selection = selectionFor(files);
  const analysis = analyzeRepositoryContents({ files, selection });
  const checks = new Map(analysis.checks.map((check) => [check.key, check]));

  assert.equal(checks.get("ci.tests")?.status, "passed");
  assert.equal(checks.get("ci.pull_request")?.status, "passed");
  assert.equal(checks.get("docker.multi_stage")?.status, "passed");
  assert.equal(checks.get("docker.non_root")?.status, "passed");
  assert.equal(checks.get("readme.setup")?.status, "passed");
  assert.equal(checks.get("env.safe_placeholders")?.status, "warning");
  assert.ok(!JSON.stringify(analysis).includes("real-looking-secret-value"));

  const score = calculateDevOpsScore({ ...createAnalysisFixture(), contentAnalysis: analysis });
  const rules = score.categories.flatMap((category) => category.rules);
  assert.equal(rules.find((rule) => rule.id === "ci_cd.tests")?.passed, true);
  assert.equal(rules.find((rule) => rule.id === "configuration.env_safety")?.passed, false);
});

test("content fetch failures degrade to warnings", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("not found", { status: 404 });

  try {
    const result = await fetchGitHubRepositoryContents(
      "Jandroel",
      "redevops-lab",
      "main",
      [{ path: "README.md", kind: "readme", size: 100 }],
      { contentTimeoutMs: 100 }
    );

    assert.equal(result.files.length, 0);
    assert.equal(result.failedFiles, 1);
    assert.match(result.warnings[0], /404/);
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
  const guidedMissions = generateGuidedLearningMissions({
    analysis,
    checklist,
    modules: learningModules,
    labs,
    concepts,
    level: "beginner",
    language: "en"
  });

  assert.equal(score.maxScore, 100);
  assert.equal(score.categories.length, 7);
  assert.ok(
    score.categories.every(
      (category) =>
        category.rules.reduce((total, rule) => total + rule.maxPoints, 0) === category.maxScore
    )
  );
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
  assert.ok(guidedMissions.length >= 3);
  assert.ok(guidedMissions.length <= 4);
  assert.ok(guidedMissions.every((mission) => mission.steps.length >= 3));
  assert.ok(guidedMissions.every((mission) => mission.evidence.length >= 1));
  assert.ok(
    guidedMissions.every((mission) =>
      mission.knowledgeCheck.options.some((option) => option.correct)
    )
  );
  assert.equal(guidedMissions[0].evidenceLevel, "inferred");
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

function treeFile(path, size) {
  return { path, type: "file", size };
}

function contentFile(path, kind, content) {
  return {
    path,
    kind,
    content,
    size: Buffer.byteLength(content),
    truncated: false
  };
}

function selectionFor(files) {
  return {
    files: files.map(({ path, kind, size }) => ({ path, kind, size })),
    candidateFiles: files.length,
    skippedLargeFiles: 0,
    maxFiles: 10,
    maxFileBytes: 96_000,
    maxTotalBytes: 480_000
  };
}
