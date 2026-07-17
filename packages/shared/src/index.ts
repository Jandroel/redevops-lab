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

export type ProductionChecklistCategory = DevOpsScoreCategoryKey;

export type ChecklistItemStatus = "done" | "missing" | "recommended";

export type AiProviderName = "mock" | "openai" | "deepseek" | "openrouter" | "groq" | "custom";

export type AiMentorMode = "learning" | "interview" | "production" | "portfolio" | "open-source";

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
  mentorMode?: AiMentorMode;
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

export interface ProductionChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  category: ProductionChecklistCategory;
  priority: "low" | "medium" | "high";
  evidence: string[];
}

export interface DevOpsLab {
  id: string;
  title: string;
  difficulty: ExperienceLevel;
  objective: string;
  whyItMatters: string;
  conceptIds?: string[];
  prerequisites?: string[];
  suggestedFiles: string[];
  steps: string[];
  commands?: string[];
  expectedOutcome?: string;
  commonMistakes?: string[];
  completionCriteria?: string[];
  verificationChecklist?: string[];
  validation: string;
  estimatedTime?: string;
  category?: ProductionChecklistCategory;
}

export interface LearningPathStep {
  id: string;
  order: number;
  title: string;
  description: string;
  topics: string[];
  relatedFiles: string[];
  labs: string[];
  status?: "completed" | "recommended" | "optional";
  difficulty?: ExperienceLevel;
}

export interface DevOpsConcept {
  id: string;
  term: string;
  category: ProductionChecklistCategory | "general";
  shortDefinition: string;
  beginnerExplanation: string;
  whyItMatters: string;
  example: string;
  relatedTerms: string[];
}

export interface DevOpsLearningModule {
  id: string;
  title: string;
  category: ProductionChecklistCategory | "general";
  summary: string;
  beginnerGoal: string;
  whyNow: string;
  concepts: string[];
  labs: string[];
  checklistItems: string[];
  estimatedTime: string;
  outcome: string;
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

export interface AiReportEnhancement {
  enabled: boolean;
  provider: AiProviderName;
  model?: string;
  mode: AiMentorMode;
  generatedAt?: string;
  mentorSummary: string;
  scoreInterpretation: string;
  recommendedFocus: string;
  riskExplanation: string;
  mentorNotes: string[];
  portfolioAdvice: string[];
  interviewTalkingPoints: string[];
  improvedNextSteps: string[];
  learningAdvice: string[];
}

export interface DevOpsReport {
  id: string;
  repository: RepositoryMetadata;
  input: RepositoryInput;
  score: DevOpsScoreSummary;
  detectedStack: DetectedStackItem[];
  findings: DevOpsFinding[];
  productionChecklist: ProductionChecklistItem[];
  learningPath: LearningPathStep[];
  labs: DevOpsLab[];
  concepts?: DevOpsConcept[];
  learningModules?: DevOpsLearningModule[];
  ai?: AiReportEnhancement;
  analysis?: RepositoryAnalysis;
  generatedAt: string;
}
