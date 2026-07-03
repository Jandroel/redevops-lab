import type { DevOpsScoreCategoryKey } from "@redevops-lab/shared";

export interface ScoreCategoryDefinition {
  key: DevOpsScoreCategoryKey;
  name: string;
  maxScore: number;
}

export const scoreCategories: ScoreCategoryDefinition[] = [
  { key: "containerization", name: "Containerization", maxScore: 20 },
  { key: "ci_cd", name: "CI/CD", maxScore: 20 },
  { key: "configuration", name: "Configuration", maxScore: 15 },
  { key: "security", name: "Security", maxScore: 15 },
  { key: "observability", name: "Observability", maxScore: 10 },
  { key: "documentation", name: "Documentation", maxScore: 10 },
  { key: "infrastructure", name: "Infrastructure", maxScore: 10 }
];

export const totalMaxScore = scoreCategories.reduce((sum, category) => sum + category.maxScore, 0);
