export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type ReportLanguage = "es" | "en";

export type RepositoryProvider = "github";

export type StackCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "language"
  | "testing"
  | "unknown";

export type RepoTreeItemType = "file" | "directory" | "symlink" | "submodule" | "unknown";

export type DevOpsSignalCategory =
  | "containerization"
  | "ci_cd"
  | "configuration"
  | "security"
  | "observability"
  | "documentation"
  | "infrastructure"
  | "deployment";

export type DevOpsScoreCategoryKey =
  | "containerization"
  | "ci_cd"
  | "configuration"
  | "security"
  | "observability"
  | "documentation"
  | "infrastructure";

export type DevOpsMaturityLevel =
  | "Initial"
  | "Foundation"
  | "Operational"
  | "Production-Ready"
  | "Advanced";

export type FindingType = "strength" | "missing" | "risk" | "recommendation";

export type FindingSeverity = "low" | "medium" | "high";

export interface RepositoryInput {
  url: string;
  level: ExperienceLevel;
  language: ReportLanguage;
}

export interface RepositoryIdentity {
  provider: RepositoryProvider;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch?: string;
}

export interface RepositoryMetadata extends RepositoryIdentity {
  description?: string | null;
  stars?: number;
  forks?: number;
  openIssues?: number;
  license?: string | null;
  isPrivate?: boolean;
  pushedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RepoTreeItem {
  path: string;
  type: RepoTreeItemType;
  size?: number;
  extension?: string;
}

export interface DetectedStackItem {
  name: string;
  category: StackCategory;
  confidence: number;
}

export interface DevOpsSignal {
  key: string;
  label: string;
  category: DevOpsSignalCategory;
  detected: boolean;
  confidence: number;
  files: string[];
  description: string;
}

export interface RepositoryAnalysis {
  repository: RepositoryMetadata;
  tree: RepoTreeItem[];
  importantFiles: string[];
  devopsSignals: DevOpsSignal[];
  detectedStack: DetectedStackItem[];
  generatedAt: string;
  warnings?: string[];
  treeStats?: {
    totalItems: number;
    analyzedItems: number;
    truncated: boolean;
  };
}

export interface DevOpsScoreRule {
  id: string;
  category: DevOpsScoreCategoryKey;
  title: string;
  description: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  evidence: string[];
  recommendation?: string;
  severity?: FindingSeverity;
}

export interface DevOpsCategoryScore {
  key: DevOpsScoreCategoryKey;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  summary: string;
  rules: DevOpsScoreRule[];
}

export interface DevOpsFinding {
  type: FindingType;
  title: string;
  description: string;
  severity?: FindingSeverity;
}

export interface DevOpsLab {
  id: string;
  title: string;
  difficulty: ExperienceLevel;
  objective: string;
  suggestedFiles: string[];
  validation: string;
  estimatedTime?: string;
}

export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  topics: string[];
  labs: string[];
}

export interface DevOpsScoreSummary {
  total: number;
  maxScore: number;
  percentage: number;
  maturityLevel: DevOpsMaturityLevel;
  categories: DevOpsCategoryScore[];
  strengths: string[];
  weaknesses: string[];
  nextBestActions: string[];
}

export interface DevOpsReport {
  id: string;
  repository: RepositoryMetadata;
  input: RepositoryInput;
  score: DevOpsScoreSummary;
  detectedStack: DetectedStackItem[];
  findings: DevOpsFinding[];
  learningPath: LearningPathStep[];
  labs: DevOpsLab[];
  analysis?: RepositoryAnalysis;
  generatedAt: string;
}
