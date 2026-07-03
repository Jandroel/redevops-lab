import type { DevOpsCategoryScore } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface ScoringEvidenceProps {
  categories: readonly DevOpsCategoryScore[];
}

export function ScoringEvidence({ categories }: ScoringEvidenceProps) {
  return (
    <section className="rounded-lg border border-devops-border bg-devops-surface/70 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Scoring Evidence</h2>
        <Badge tone="green">Explainable rules</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {categories.map((category) => (
          <article key={category.key} className="rounded-lg border border-devops-border bg-slate-950/55 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-devops-muted">{category.summary}</p>
              </div>
              <span className="shrink-0 font-mono text-sm text-devops-text">
                {category.score}/{category.maxScore}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {category.rules.map((rule) => (
                <div key={rule.id} className="rounded-md border border-devops-border bg-devops-bg/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-devops-text">
                        {rule.passed ? "+" : "!"} {rule.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-devops-muted">{rule.description}</p>
                    </div>
                    <Badge tone={rule.passed ? "green" : "amber"}>
                      +{rule.points}/{rule.maxPoints}
                    </Badge>
                  </div>
                  {rule.evidence.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rule.evidence.slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="rounded-md border border-devops-border bg-slate-950/75 px-2 py-1 font-mono text-[11px] text-devops-muted"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : rule.recommendation ? (
                    <p className="mt-3 text-xs leading-5 text-devops-muted">{rule.recommendation}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
