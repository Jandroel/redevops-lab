import type { DevOpsCategoryScore, DevOpsScoreRule } from "@redevops-lab/shared";

const severityWeight = {
  high: 3,
  medium: 2,
  low: 1
} as const;

export function createStrengths(categories: DevOpsCategoryScore[]): string[] {
  return categories
    .flatMap((category) =>
      category.rules
        .filter((rule) => rule.passed)
        .map((rule) => `${rule.title} (+${rule.points})`)
    )
    .slice(0, 6);
}

export function createWeaknesses(categories: DevOpsCategoryScore[]): string[] {
  const categoryWeaknesses = categories
    .filter((category) => category.percentage < 50)
    .map((category) => `${category.name} is below 50% (${category.score}/${category.maxScore}).`);
  const ruleWeaknesses = failedRules(categories)
    .filter((rule) => rule.severity === "high" || rule.maxPoints >= 4)
    .map((rule) => rule.title);

  return [...categoryWeaknesses, ...ruleWeaknesses].slice(0, 8);
}

export function createNextBestActions(categories: DevOpsCategoryScore[]): string[] {
  return failedRules(categories)
    .sort((a, b) => {
      const severityDiff =
        severityWeight[b.severity ?? "low"] - severityWeight[a.severity ?? "low"];

      return severityDiff || b.maxPoints - a.maxPoints;
    })
    .map((rule) => rule.recommendation)
    .filter((value): value is string => Boolean(value))
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 5);
}

function failedRules(categories: DevOpsCategoryScore[]): DevOpsScoreRule[] {
  return categories.flatMap((category) => category.rules.filter((rule) => !rule.passed));
}
