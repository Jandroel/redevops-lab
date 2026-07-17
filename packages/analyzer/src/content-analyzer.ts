import type {
  DevOpsScoreCategoryKey,
  RepositoryAnalyzedContentFile,
  RepositoryContentAnalysis,
  RepositoryContentCheck,
  RepositoryContentCheckStatus,
  RepositoryContentFileKind
} from "@redevops-lab/shared";
import { parseDocument } from "yaml";
import type { ContentFileSelection } from "./content-selector.js";

export interface FetchedContentFile {
  path: string;
  kind: RepositoryContentFileKind;
  size: number;
  content: string;
  truncated: boolean;
}

export interface AnalyzeRepositoryContentsInput {
  files: FetchedContentFile[];
  selection: ContentFileSelection;
  failedFiles?: number;
  warnings?: string[];
}

interface FileAnalysisResult {
  checks: RepositoryContentCheck[];
  warnings: string[];
}

export function analyzeRepositoryContents({
  files,
  selection,
  failedFiles = 0,
  warnings = []
}: AnalyzeRepositoryContentsInput): RepositoryContentAnalysis {
  const fileResults = files.map((file) => ({
    file,
    result: analyzeContentFile(file)
  }));
  const allChecks = fileResults.flatMap(({ result }) => result.checks);
  const aggregatedChecks = aggregateChecks(allChecks);
  const analyzedFiles: RepositoryAnalyzedContentFile[] = fileResults.map(({ file, result }) => ({
    path: file.path,
    kind: file.kind,
    size: file.size,
    truncated: file.truncated,
    checks: unique(result.checks.map((check) => check.key))
  }));

  return {
    files: analyzedFiles,
    checks: aggregatedChecks,
    warnings: unique([...warnings, ...fileResults.flatMap(({ result }) => result.warnings)]),
    stats: {
      candidateFiles: selection.candidateFiles,
      selectedFiles: selection.files.length,
      analyzedFiles: analyzedFiles.length,
      skippedLargeFiles: selection.skippedLargeFiles,
      failedFiles,
      totalBytes: files.reduce((total, file) => total + file.size, 0),
      maxFiles: selection.maxFiles,
      maxFileBytes: selection.maxFileBytes,
      maxTotalBytes: selection.maxTotalBytes
    }
  };
}

function analyzeContentFile(file: FetchedContentFile): FileAnalysisResult {
  switch (file.kind) {
    case "package_json":
      return analyzePackageJson(file);
    case "workflow":
      return analyzeWorkflow(file);
    case "dockerfile":
      return analyzeDockerfile(file);
    case "compose":
      return analyzeCompose(file);
    case "readme":
      return analyzeReadme(file);
    case "env_example":
      return analyzeEnvExample(file);
  }
}

function analyzePackageJson(file: FetchedContentFile): FileAnalysisResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(file.content);
  } catch {
    return {
      checks: [],
      warnings: [`${file.path} could not be parsed as JSON.`]
    };
  }

  const root = asRecord(parsed);
  if (!root) {
    return { checks: [], warnings: [`${file.path} does not contain a JSON object.`] };
  }

  const scripts = asRecord(root.scripts) ?? {};
  const scriptEntries = Object.entries(scripts).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string"
  );
  const scriptChecks = [
    packageScriptCheck(file.path, scriptEntries, "package.scripts.test", "test", /(test|spec)/i),
    packageScriptCheck(
      file.path,
      scriptEntries,
      "package.scripts.lint",
      "lint",
      /lint|eslint|ruff/i
    ),
    packageScriptCheck(
      file.path,
      scriptEntries,
      "package.scripts.typecheck",
      "typecheck",
      /typecheck|type-check|tsc.*--noemit/i
    ),
    packageScriptCheck(file.path, scriptEntries, "package.scripts.build", "build", /build|compile/i)
  ];
  const packageManager = typeof root.packageManager === "string" ? root.packageManager : undefined;

  return {
    checks: [
      ...scriptChecks,
      makeCheck({
        key: "package.package_manager",
        category: "configuration",
        status: packageManager ? "passed" : "missing",
        confidence: packageManager ? 1 : 0.85,
        title: "Package manager declared",
        description: packageManager
          ? "package.json declares the expected package manager."
          : "package.json does not declare a packageManager field.",
        evidence: packageManager ? [`${file.path}: packageManager is declared`] : [],
        recommendation: "Declare packageManager so local development and CI use the same tool."
      })
    ],
    warnings: []
  };
}

function packageScriptCheck(
  path: string,
  scripts: Array<[string, string]>,
  key: string,
  label: string,
  pattern: RegExp
): RepositoryContentCheck {
  const namedMatches = scripts.filter(([name]) => pattern.test(name));
  const matches = namedMatches.length
    ? namedMatches
    : scripts.filter(([, command]) => pattern.test(command));

  return makeCheck({
    key,
    category: "ci_cd",
    status: matches.length ? "passed" : "missing",
    confidence: matches.length ? 0.98 : 0.9,
    title: `${label} script declared`,
    description: matches.length
      ? `A ${label} script is available for local development or CI.`
      : `No ${label} script was found in this package.json.`,
    evidence: matches.map(([name]) => `${path}: script '${name}'`),
    recommendation: `Add a ${label} script with a repeatable project command.`
  });
}

function analyzeWorkflow(file: FetchedContentFile): FileAnalysisResult {
  const parsed = parseYamlRecord(file);
  if (!parsed.value) {
    return { checks: [], warnings: parsed.warnings };
  }

  const trigger = parsed.value.on;
  const jobs = asRecord(parsed.value.jobs) ?? {};
  const searchable = workflowSearchText(jobs);
  const checks: Array<{
    key: string;
    label: string;
    category: DevOpsScoreCategoryKey;
    pattern: RegExp;
    recommendation: string;
  }> = [
    {
      key: "ci.tests",
      label: "tests",
      category: "ci_cd",
      pattern: /\b(test|pytest|go test|cargo test|mvn test|gradle test|dotnet test)\b/i,
      recommendation: "Run the repository test command in CI."
    },
    {
      key: "ci.lint",
      label: "lint",
      category: "ci_cd",
      pattern: /\b(lint|eslint|ruff|flake8|golangci-lint|pylint)\b/i,
      recommendation: "Run lint in CI before merging changes."
    },
    {
      key: "ci.typecheck",
      label: "typecheck",
      category: "ci_cd",
      pattern: /\b(typecheck|type-check|tsc\b.*--noemit|mypy|pyright)\b/i,
      recommendation: "Run static type checks in CI when the stack supports them."
    },
    {
      key: "ci.build",
      label: "build",
      category: "ci_cd",
      pattern: /\b(build|next build|docker build|go build|cargo build|mvn package|gradle build)\b/i,
      recommendation: "Run a production build in CI."
    },
    {
      key: "ci.security",
      label: "security scanning",
      category: "security",
      pattern: /\b(codeql|trivy|snyk|semgrep|gitleaks|npm audit|pnpm audit|pip-audit|bandit)\b/i,
      recommendation: "Add a dependency, code, container, or secret scan to CI."
    },
    {
      key: "ci.deploy",
      label: "deployment",
      category: "ci_cd",
      pattern: /\b(deploy|release|publish|vercel|railway|kubectl|helm)\b/i,
      recommendation: "Add deployment automation only after validation and rollback are documented."
    }
  ];
  const pullRequest = hasPullRequestTrigger(trigger);

  return {
    checks: [
      makeCheck({
        key: "ci.pull_request",
        category: "ci_cd",
        status: pullRequest ? "passed" : "missing",
        confidence: 0.98,
        title: "Pull request validation configured",
        description: pullRequest
          ? "The workflow runs for pull request events."
          : "The workflow does not expose a pull_request trigger.",
        evidence: pullRequest ? [`${file.path}: pull_request trigger`] : [],
        recommendation: "Run validation workflows for pull requests."
      }),
      ...checks.map((definition) => {
        const passed = definition.pattern.test(searchable);

        return makeCheck({
          key: definition.key,
          category: definition.category,
          status: passed ? "passed" : "missing",
          confidence: passed ? 0.94 : 0.85,
          title: `CI ${definition.label} detected`,
          description: passed
            ? `Workflow steps include ${definition.label}.`
            : `No ${definition.label} command or action was detected in this workflow.`,
          evidence: passed ? [`${file.path}: ${definition.label} step`] : [],
          recommendation: definition.recommendation
        });
      })
    ],
    warnings: parsed.warnings
  };
}

function analyzeDockerfile(file: FetchedContentFile): FileAnalysisResult {
  const lines = logicalDockerfileLines(file.content);
  const fromLines = lines.filter((line) => /^FROM\s+/i.test(line));
  const userLines = lines.filter((line) => /^USER\s+/i.test(line));
  const lastUser = userLines
    .at(-1)
    ?.replace(/^USER\s+/i, "")
    .trim();
  const nonRoot = Boolean(lastUser && !/^(root|0)(:|$)/i.test(lastUser));
  const multiStage = fromLines.length >= 2;
  const reproducibleInstall = lines.some((line) =>
    /(npm ci|pnpm (?:--[^ ]+ )*install[^\n]*--frozen-lockfile|yarn (?:install )?(?:--frozen-lockfile|--immutable)|pip install[^\n]*--require-hashes)/i.test(
      line
    )
  );
  const healthcheck = lines.some((line) => /^HEALTHCHECK\s+/i.test(line));
  const pinnedBase =
    fromLines.length > 0 &&
    fromLines.every((line) => {
      const image = line.split(/\s+/)[1] ?? "";
      return image.includes("@sha256:") || (image.includes(":") && !/:latest$/i.test(image));
    });

  return {
    checks: [
      binaryCheck(file.path, "docker.multi_stage", "containerization", multiStage, {
        title: "Multi-stage Docker build",
        passed: "The Dockerfile separates at least two build stages.",
        missing: "The Dockerfile uses a single build stage.",
        recommendation:
          "Use a multi-stage build when it reduces runtime dependencies or image size."
      }),
      binaryCheck(file.path, "docker.non_root", "security", nonRoot, {
        title: "Non-root container user",
        passed: "The final Dockerfile user is not root.",
        missing: "No final non-root USER directive was detected.",
        recommendation: "Run the application as a dedicated non-root user."
      }),
      binaryCheck(
        file.path,
        "docker.reproducible_install",
        "containerization",
        reproducibleInstall,
        {
          title: "Reproducible dependency install",
          passed: "The Dockerfile uses a lockfile-oriented install command.",
          missing: "No frozen or lockfile-oriented dependency install command was detected.",
          recommendation:
            "Use npm ci, pnpm --frozen-lockfile, Yarn immutable installs, or an equivalent."
        }
      ),
      binaryCheck(file.path, "docker.healthcheck", "observability", healthcheck, {
        title: "Container health check",
        passed: "A Docker HEALTHCHECK directive is present.",
        missing: "No Docker HEALTHCHECK directive was detected.",
        recommendation: "Add a health check when the runtime platform relies on image-level probes."
      }),
      binaryCheck(file.path, "docker.pinned_base", "security", pinnedBase, {
        title: "Versioned base image",
        passed: "Every base image uses an explicit tag or digest.",
        missing: "At least one base image is unversioned or uses latest.",
        recommendation: "Use explicit base image tags or digests and update them deliberately."
      })
    ],
    warnings: []
  };
}

function analyzeCompose(file: FetchedContentFile): FileAnalysisResult {
  const parsed = parseYamlRecord(file);
  if (!parsed.value) {
    return { checks: [], warnings: parsed.warnings };
  }

  const services = asRecord(parsed.value.services) ?? {};
  const serviceRecords = Object.values(services)
    .map(asRecord)
    .filter((service): service is Record<string, unknown> => Boolean(service));
  const serviceCount = serviceRecords.length;
  const envFile = serviceRecords.some((service) => "env_file" in service);
  const healthcheck = serviceRecords.some((service) => asRecord(service.healthcheck));

  return {
    checks: [
      makeCheck({
        key: "compose.services",
        category: "containerization",
        status: serviceCount ? "passed" : "missing",
        confidence: 0.98,
        title: "Compose services declared",
        description: serviceCount
          ? `Compose declares ${serviceCount} service(s).`
          : "Compose does not contain a services mapping.",
        evidence: serviceCount ? [`${file.path}: ${serviceCount} service(s)`] : [],
        recommendation: "Declare services under the Compose services mapping."
      }),
      binaryCheck(file.path, "compose.env_file", "configuration", envFile, {
        title: "Compose environment file reference",
        passed: "At least one service uses env_file.",
        missing: "No service uses env_file.",
        recommendation: "Use env_file or documented runtime variables without committing secrets."
      }),
      binaryCheck(file.path, "compose.healthcheck", "observability", healthcheck, {
        title: "Compose health check",
        passed: "At least one service declares a healthcheck.",
        missing: "No Compose service healthcheck was detected.",
        recommendation: "Add service health checks for dependencies that need readiness ordering."
      })
    ],
    warnings: parsed.warnings
  };
}

function analyzeReadme(file: FetchedContentFile): FileAnalysisResult {
  const text = normalizeSearchText(file.content);
  const definitions = [
    [
      "readme.setup",
      "documentation",
      "setup or installation",
      /(getting started|quick start|installation|install|setup|requisitos|prerequisites)/
    ],
    [
      "readme.configuration",
      "configuration",
      "runtime configuration",
      /(environment variables|\.env|configuration|configuracion|variables de entorno)/
    ],
    [
      "readme.testing",
      "documentation",
      "testing",
      /(tests?|testing|pruebas|pnpm test|npm test|pytest|go test)/
    ],
    [
      "readme.deployment",
      "documentation",
      "deployment",
      /(deploy|deployment|release|despliegue|produccion)/
    ],
    [
      "readme.architecture",
      "documentation",
      "architecture",
      /(architecture|arquitectura|project structure|estructura del proyecto)/
    ],
    [
      "readme.troubleshooting",
      "documentation",
      "troubleshooting",
      /(troubleshooting|known issues|common errors|problemas|errores comunes)/
    ]
  ] as const;

  return {
    checks: definitions.map(([key, category, label, pattern]) => {
      const passed = pattern.test(text);

      return makeCheck({
        key,
        category,
        status: passed ? "passed" : "missing",
        confidence: passed ? 0.9 : 0.78,
        title: `README covers ${label}`,
        description: passed
          ? `The README includes ${label} guidance.`
          : `The README does not clearly cover ${label}.`,
        evidence: passed ? [`${file.path}: ${label} section or wording`] : [],
        recommendation: `Add a concise README section for ${label}.`
      });
    }),
    warnings: []
  };
}

function analyzeEnvExample(file: FetchedContentFile): FileAnalysisResult {
  const variables = file.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({ key: match[1]!, value: match[2] ?? "" }));
  const suspiciousKeys = variables
    .filter(({ key, value }) => isSensitiveKey(key) && !isSafeExampleValue(value))
    .map(({ key }) => key);

  return {
    checks: [
      makeCheck({
        key: "env.variables_documented",
        category: "configuration",
        status: variables.length ? "passed" : "missing",
        confidence: 0.98,
        title: "Environment variables documented",
        description: variables.length
          ? `${variables.length} variable name(s) are documented without exposing their values in the report.`
          : "No KEY=value entries were detected in the example file.",
        evidence: variables.length ? [`${file.path}: ${variables.length} variable name(s)`] : [],
        recommendation: "Document every required runtime variable with safe example values."
      }),
      makeCheck({
        key: "env.safe_placeholders",
        category: "security",
        status: suspiciousKeys.length ? "warning" : variables.length ? "passed" : "missing",
        confidence: suspiciousKeys.length ? 0.82 : 0.92,
        title: "Environment example uses safe placeholders",
        description: suspiciousKeys.length
          ? "Sensitive-looking variables may contain values that need manual review. Values are never included in the report."
          : "No suspicious real-looking value was detected for sensitive variable names.",
        evidence: suspiciousKeys.length
          ? [`${file.path}: review key(s) ${suspiciousKeys.slice(0, 6).join(", ")}`]
          : variables.length
            ? [`${file.path}: placeholders look safe`]
            : [],
        recommendation:
          "Keep only empty, fake, or clearly documented placeholder values in example env files."
      })
    ],
    warnings: []
  };
}

function parseYamlRecord(file: FetchedContentFile): {
  value?: Record<string, unknown>;
  warnings: string[];
} {
  try {
    const document = parseDocument(file.content, {
      prettyErrors: false,
      uniqueKeys: true
    });

    if (document.errors.length) {
      return { warnings: [`${file.path} contains invalid YAML.`] };
    }

    const value = asRecord(document.toJS({ maxAliasCount: 10 }));
    return value
      ? { value, warnings: [] }
      : { warnings: [`${file.path} does not contain a YAML mapping.`] };
  } catch {
    return { warnings: [`${file.path} could not be parsed safely as YAML.`] };
  }
}

function workflowSearchText(jobs: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [jobName, jobValue] of Object.entries(jobs)) {
    parts.push(jobName);
    const job = asRecord(jobValue);
    if (!job) {
      continue;
    }

    if (typeof job.name === "string") {
      parts.push(job.name);
    }

    for (const stepValue of asArray(job.steps)) {
      const step = asRecord(stepValue);
      if (!step) {
        continue;
      }

      for (const key of ["name", "run", "uses"]) {
        if (typeof step[key] === "string") {
          parts.push(step[key]);
        }
      }
    }
  }

  return parts.join("\n");
}

function hasPullRequestTrigger(trigger: unknown): boolean {
  if (typeof trigger === "string") {
    return trigger === "pull_request" || trigger === "pull_request_target";
  }

  if (Array.isArray(trigger)) {
    return trigger.some(hasPullRequestTrigger);
  }

  const record = asRecord(trigger);
  return Boolean(record && ("pull_request" in record || "pull_request_target" in record));
}

function logicalDockerfileLines(content: string): string[] {
  const result: string[] = [];
  let current = "";

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, "").trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    current = current ? `${current} ${line}` : line;
    if (current.endsWith("\\")) {
      current = current.slice(0, -1).trimEnd();
      continue;
    }

    result.push(current);
    current = "";
  }

  if (current) {
    result.push(current);
  }

  return result;
}

function binaryCheck(
  path: string,
  key: string,
  category: DevOpsScoreCategoryKey,
  passed: boolean,
  copy: {
    title: string;
    passed: string;
    missing: string;
    recommendation: string;
  }
): RepositoryContentCheck {
  return makeCheck({
    key,
    category,
    status: passed ? "passed" : "missing",
    confidence: passed ? 0.96 : 0.88,
    title: copy.title,
    description: passed ? copy.passed : copy.missing,
    evidence: passed ? [`${path}: ${copy.title.toLowerCase()}`] : [],
    recommendation: copy.recommendation
  });
}

function makeCheck(input: RepositoryContentCheck): RepositoryContentCheck {
  return input;
}

function aggregateChecks(checks: RepositoryContentCheck[]): RepositoryContentCheck[] {
  const groups = new Map<string, RepositoryContentCheck[]>();

  for (const check of checks) {
    groups.set(check.key, [...(groups.get(check.key) ?? []), check]);
  }

  return [...groups.values()]
    .map((group) => {
      const best = [...group].sort(
        (left, right) => statusWeight(right.status) - statusWeight(left.status)
      )[0]!;
      const evidence = unique(group.flatMap((check) => check.evidence)).slice(0, 12);

      return {
        ...best,
        evidence,
        confidence: Math.max(...group.map((check) => check.confidence))
      };
    })
    .sort(
      (left, right) =>
        left.category.localeCompare(right.category) || left.key.localeCompare(right.key)
    );
}

function statusWeight(status: RepositoryContentCheckStatus): number {
  const weights: Record<RepositoryContentCheckStatus, number> = {
    passed: 4,
    warning: 3,
    info: 2,
    missing: 1
  };

  return weights[status];
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isSensitiveKey(key: string): boolean {
  return /(token|secret|password|passwd|api_key|apikey|private_key|credential)/i.test(key);
}

function isSafeExampleValue(value: string): boolean {
  const normalized = value.trim().replace(/^['"]|['"]$/g, "");

  return (
    !normalized ||
    /^(example|sample|changeme|placeholder|your[-_]|xxx|todo|replace[-_])/i.test(normalized) ||
    /^<[^>]+>$/.test(normalized) ||
    /localhost|127\.0\.0\.1|user:password|username:password/i.test(normalized) ||
    normalized.length < 12
  );
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
