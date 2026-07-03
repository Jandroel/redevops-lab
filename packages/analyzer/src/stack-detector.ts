import type { DetectedStackItem, RepoTreeItem, StackCategory } from "@redevops-lab/shared";

interface StackRule {
  name: string;
  category: StackCategory;
  confidence: number;
  match(paths: Set<string>): boolean;
}

const rules: StackRule[] = [
  { name: "JavaScript", category: "language", confidence: 0.75, match: has("package.json") },
  { name: "TypeScript", category: "language", confidence: 0.92, match: has("tsconfig.json") },
  { name: "Next.js", category: "frontend", confidence: 0.9, match: hasPrefix("next.config.") },
  { name: "Vite", category: "frontend", confidence: 0.86, match: hasPrefix("vite.config.") },
  { name: "NestJS", category: "backend", confidence: 0.82, match: has("nest-cli.json") },
  { name: "Tailwind CSS", category: "frontend", confidence: 0.78, match: hasPrefix("tailwind.config.") },
  { name: "Prisma", category: "database", confidence: 0.9, match: has("prisma/schema.prisma") },
  { name: "Drizzle ORM", category: "database", confidence: 0.82, match: hasPrefix("drizzle.config.") },
  { name: "TypeORM", category: "database", confidence: 0.7, match: hasPrefix("typeorm.config.") },
  { name: "Python", category: "language", confidence: 0.86, match: any(["requirements.txt", "pyproject.toml", "pipfile", "poetry.lock"]) },
  { name: "Django", category: "backend", confidence: 0.82, match: has("manage.py") },
  { name: "FastAPI", category: "backend", confidence: 0.45, match: any(["main.py", "app/main.py"]) },
  { name: "Go", category: "language", confidence: 0.9, match: has("go.mod") },
  { name: "Java", category: "language", confidence: 0.86, match: any(["pom.xml", "build.gradle", "settings.gradle"]) },
  { name: ".NET", category: "backend", confidence: 0.85, match: extension(".csproj", ".sln") },
  { name: "Rust", category: "language", confidence: 0.9, match: has("cargo.toml") },
  { name: "PHP", category: "language", confidence: 0.85, match: has("composer.json") },
  { name: "Laravel", category: "backend", confidence: 0.8, match: has("artisan") },
  { name: "Docker", category: "devops", confidence: 0.9, match: (paths) => [...paths].some((path) => path.endsWith("dockerfile") || path.endsWith(".dockerfile")) },
  { name: "GitHub Actions", category: "devops", confidence: 0.9, match: (paths) => [...paths].some((path) => /^\\.github\\/workflows\\/.+\\.ya?ml$/i.test(path)) },
  { name: "Terraform", category: "devops", confidence: 0.88, match: (paths) => [...paths].some((path) => path.startsWith("terraform/") || path.endsWith(".tf")) },
  { name: "Kubernetes", category: "devops", confidence: 0.82, match: (paths) => [...paths].some((path) => path.startsWith("k8s/") || path.startsWith("kubernetes/")) },
  { name: "Helm", category: "devops", confidence: 0.84, match: (paths) => [...paths].some((path) => path.startsWith("helm/") || path.endsWith("chart.yaml")) },
  { name: "Prometheus", category: "devops", confidence: 0.78, match: any(["prometheus.yml", "prometheus.yaml"]) },
  { name: "Grafana", category: "devops", confidence: 0.72, match: (paths) => [...paths].some((path) => path.startsWith("grafana/")) }
];

export function detectStack(tree: RepoTreeItem[]): DetectedStackItem[] {
  const paths = new Set(tree.filter((item) => item.type === "file").map((item) => item.path.toLowerCase()));

  return rules
    .filter((rule) => rule.match(paths))
    .map((rule) => ({
      name: rule.name,
      category: rule.category,
      confidence: rule.confidence
    }))
    .sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name));
}

function has(path: string): (paths: Set<string>) => boolean {
  return (paths) => paths.has(path);
}

function hasPrefix(prefix: string): (paths: Set<string>) => boolean {
  return (paths) => [...paths].some((path) => path.split("/").at(-1)?.startsWith(prefix));
}

function any(pathsToFind: string[]): (paths: Set<string>) => boolean {
  return (paths) => pathsToFind.some((path) => paths.has(path));
}

function extension(...extensions: string[]): (paths: Set<string>) => boolean {
  return (paths) => [...paths].some((path) => extensions.some((ext) => path.endsWith(ext)));
}
