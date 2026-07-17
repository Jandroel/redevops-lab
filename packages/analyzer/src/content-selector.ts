import type { RepoTreeItem, RepositoryContentFileKind } from "@redevops-lab/shared";

export interface ContentSelectionOptions {
  maxContentFiles?: number;
  maxContentFileBytes?: number;
  maxContentBytes?: number;
}

export interface SelectedContentFile {
  path: string;
  kind: RepositoryContentFileKind;
  size: number;
}

export interface ContentFileSelection {
  files: SelectedContentFile[];
  candidateFiles: number;
  skippedLargeFiles: number;
  maxFiles: number;
  maxFileBytes: number;
  maxTotalBytes: number;
}

const perKindLimits: Record<RepositoryContentFileKind, number> = {
  package_json: 3,
  workflow: 3,
  dockerfile: 2,
  compose: 2,
  readme: 1,
  env_example: 2
};

export function selectRepositoryContentFiles(
  tree: RepoTreeItem[],
  options: ContentSelectionOptions = {}
): ContentFileSelection {
  const maxFiles = options.maxContentFiles ?? 10;
  const maxFileBytes = options.maxContentFileBytes ?? 96_000;
  const maxTotalBytes = options.maxContentBytes ?? 480_000;
  const candidates = tree
    .filter((item) => item.type === "file")
    .map((item) => {
      const kind = contentFileKind(item.path);

      return kind
        ? {
            path: item.path,
            kind,
            size: item.size ?? 0,
            priority: contentPriority(item.path, kind)
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        pathDepth(left.path) - pathDepth(right.path) ||
        left.path.localeCompare(right.path)
    );
  const selected: SelectedContentFile[] = [];
  const selectedPerKind = new Map<RepositoryContentFileKind, number>();
  let skippedLargeFiles = 0;
  let selectedBytes = 0;

  for (const candidate of candidates) {
    if (candidate.size > maxFileBytes) {
      skippedLargeFiles += 1;
      continue;
    }

    if (selected.length >= maxFiles) {
      continue;
    }

    const kindCount = selectedPerKind.get(candidate.kind) ?? 0;
    if (kindCount >= perKindLimits[candidate.kind]) {
      continue;
    }

    const estimatedSize = candidate.size || maxFileBytes;
    if (selectedBytes + estimatedSize > maxTotalBytes) {
      skippedLargeFiles += 1;
      continue;
    }

    selected.push({
      path: candidate.path,
      kind: candidate.kind,
      size: candidate.size
    });
    selectedPerKind.set(candidate.kind, kindCount + 1);
    selectedBytes += estimatedSize;
  }

  return {
    files: selected,
    candidateFiles: candidates.length,
    skippedLargeFiles,
    maxFiles,
    maxFileBytes,
    maxTotalBytes
  };
}

export function contentFileKind(path: string): RepositoryContentFileKind | undefined {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  const name = normalized.split("/").at(-1) ?? normalized;

  if (name === "package.json") {
    return "package_json";
  }

  if (/^\.github\/workflows\/.+\.ya?ml$/.test(normalized)) {
    return "workflow";
  }

  if (name === "dockerfile" || name.endsWith(".dockerfile")) {
    return "dockerfile";
  }

  if (["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"].includes(name)) {
    return "compose";
  }

  if (name === "readme.md") {
    return "readme";
  }

  if ([".env.example", ".env.sample"].includes(name)) {
    return "env_example";
  }

  return undefined;
}

function contentPriority(path: string, kind: RepositoryContentFileKind): number {
  const depth = pathDepth(path);
  const base: Record<RepositoryContentFileKind, number> = {
    package_json: 80,
    workflow: 76,
    dockerfile: 74,
    compose: 68,
    readme: 90,
    env_example: 84
  };

  return base[kind] + (depth === 0 ? 20 : 0) - Math.min(depth, 8);
}

function pathDepth(path: string): number {
  return path.replace(/\\/g, "/").split("/").length - 1;
}
