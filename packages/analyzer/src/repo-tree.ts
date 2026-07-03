import type { RepoTreeItem, RepoTreeItemType } from "@redevops-lab/shared";

export interface FilterRepoTreeOptions {
  maxTreeItems?: number;
}

export interface FilteredRepoTree {
  tree: RepoTreeItem[];
  importantFiles: string[];
  warnings: string[];
  stats: {
    totalItems: number;
    analyzedItems: number;
    truncated: boolean;
  };
}

const ignoredPathSegments = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".cache",
  "vendor",
  "target",
  "bin",
  "obj",
  ".idea",
  ".vscode"
]);

const heavyExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".mp4",
  ".mov",
  ".avi",
  ".min.js",
  ".min.css"
]);

const importantFileNames = new Set([
  "readme.md",
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
  ".dockerignore",
  ".env.example",
  ".env.sample",
  "requirements.txt",
  "pyproject.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "settings.gradle",
  "cargo.toml",
  "composer.json",
  "nest-cli.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.js",
  "vite.config.ts",
  "tsconfig.json",
  "tailwind.config.js",
  "tailwind.config.ts",
  "prometheus.yml",
  "prometheus.yaml",
  "chart.yaml",
  "deployment.yaml",
  "service.yaml",
  "ingress.yaml",
  "dependabot.yml",
  "codeql.yml",
  "security.md",
  "deployment.md",
  "contributing.md",
  "changelog.md"
]);

export function getPathExtension(filePath: string): string | undefined {
  const normalized = filePath.toLowerCase();
  const filename = normalized.split("/").at(-1) ?? normalized;

  if (filename.endsWith(".min.js")) {
    return ".min.js";
  }

  if (filename.endsWith(".min.css")) {
    return ".min.css";
  }

  const index = filename.lastIndexOf(".");

  return index > 0 ? filename.slice(index) : undefined;
}

export function normalizeRepoTreeItem(item: {
  path: string;
  type?: string;
  size?: number;
}): RepoTreeItem {
  return {
    path: item.path,
    type: normalizeTreeItemType(item.type),
    size: item.size,
    extension: item.type === "blob" || item.type === "file" ? getPathExtension(item.path) : undefined
  };
}

export function filterRepoTree(
  items: RepoTreeItem[],
  options: FilterRepoTreeOptions = {}
): FilteredRepoTree {
  const maxTreeItems = options.maxTreeItems ?? 5000;
  const visible = items.filter((item) => !shouldIgnorePath(item.path));
  const truncated = visible.length > maxTreeItems;
  const tree = visible.slice(0, maxTreeItems);
  const warnings = truncated
    ? [`Repository tree was truncated from ${visible.length} to ${maxTreeItems} items.`]
    : [];

  return {
    tree,
    importantFiles: detectImportantFiles(tree),
    warnings,
    stats: {
      totalItems: items.length,
      analyzedItems: tree.length,
      truncated
    }
  };
}

export function detectImportantFiles(tree: RepoTreeItem[]): string[] {
  return tree
    .filter((item) => item.type === "file" && isImportantPath(item.path))
    .map((item) => item.path)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 100);
}

function normalizeTreeItemType(type?: string): RepoTreeItemType {
  switch (type) {
    case "blob":
    case "file":
      return "file";
    case "tree":
    case "directory":
      return "directory";
    case "commit":
    case "submodule":
      return "submodule";
    case "symlink":
      return "symlink";
    default:
      return "unknown";
  }
}

function shouldIgnorePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const parts = normalized.split("/");

  if (parts.some((part) => ignoredPathSegments.has(part))) {
    return true;
  }

  if (normalized.endsWith("/.ds_store") || normalized === ".ds_store") {
    return true;
  }

  const extension = getPathExtension(normalized);

  return extension ? heavyExtensions.has(extension) : false;
}

function isImportantPath(filePath: string): boolean {
  const normalized = filePath.toLowerCase();
  const filename = normalized.split("/").at(-1) ?? normalized;

  if (importantFileNames.has(filename)) {
    return true;
  }

  return (
    normalized.startsWith(".github/workflows/") ||
    normalized.startsWith("docs/") ||
    normalized.startsWith("terraform/") ||
    normalized.startsWith("k8s/") ||
    normalized.startsWith("kubernetes/") ||
    normalized.startsWith("helm/") ||
    normalized.startsWith("prisma/") ||
    normalized.startsWith("grafana/") ||
    normalized.startsWith("prometheus/")
  );
}
