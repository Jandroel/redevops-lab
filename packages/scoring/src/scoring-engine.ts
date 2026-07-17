import type {
  DevOpsScoreCategoryKey,
  DevOpsScoreRule,
  DevOpsScoreSummary,
  RepositoryAnalysis
} from "@redevops-lab/shared";
import { scoreCategories, totalMaxScore } from "./categories.js";
import { getMaturityLevel } from "./maturity.js";
import { createNextBestActions, createStrengths, createWeaknesses } from "./recommendations.js";
import { evaluateRules } from "./rules.js";

export function calculateDevOpsScore(analysis: RepositoryAnalysis): DevOpsScoreSummary {
  const rules = evaluateRules(analysis);
  const categories = scoreCategories.map((definition) => {
    const categoryRules = rules.filter((rule) => rule.category === definition.key);
    const score = sumRulePoints(categoryRules);
    const percentage = toPercentage(score, definition.maxScore);

    return {
      key: definition.key,
      name: definition.name,
      score,
      maxScore: definition.maxScore,
      percentage,
      summary: createCategorySummary(definition.key, percentage),
      rules: categoryRules
    };
  });
  const total = categories.reduce((sum, category) => sum + category.score, 0);
  const percentage = toPercentage(total, totalMaxScore);

  return {
    total,
    maxScore: totalMaxScore,
    percentage,
    maturityLevel: getMaturityLevel(percentage),
    categories,
    strengths: createStrengths(categories),
    weaknesses: createWeaknesses(categories),
    nextBestActions: createNextBestActions(categories)
  };
}

function sumRulePoints(rules: DevOpsScoreRule[]): number {
  return rules.reduce((sum, rule) => sum + rule.points, 0);
}

function toPercentage(score: number, maxScore: number): number {
  return maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
}

function createCategorySummary(key: DevOpsScoreCategoryKey, percentage: number): string {
  const status = percentage >= 75 ? "strong" : percentage >= 50 ? "developing" : "needs attention";

  const summaries: Record<DevOpsScoreCategoryKey, string> = {
    containerization: `Containerization is ${status} based on Docker and local orchestration signals.`,
    ci_cd: `CI/CD is ${status} based on pipeline triggers and validation steps found in workflow content.`,
    configuration: `Configuration readiness is ${status} based on environment examples, safe placeholders, and config structure.`,
    security: `Security automation is ${status} based on scanning, policy, and container hardening signals.`,
    observability: `Observability is ${status} based on health, logging, metrics, and tracing signals.`,
    documentation: `Documentation is ${status} based on README, docs, deployment, and contributor files.`,
    infrastructure: `Infrastructure readiness is ${status} based on IaC and deployment configuration signals.`
  };

  return summaries[key];
}
