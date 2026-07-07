import type { DevOpsCategoryScore } from "@redevops-lab/shared";

interface CategoryScoreBarsProps {
  categories: readonly DevOpsCategoryScore[];
}

export function CategoryScoreBars({ categories }: CategoryScoreBarsProps) {
  return (
    <section className="min-w-0 rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-white">Category scores</h2>
          <p className="mt-2 text-sm text-devops-muted">Rule coverage by DevOps practice area.</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-devops-muted">rule-based score</span>
      </div>
      <div className="space-y-5">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="min-w-0 text-devops-text">{category.name}</span>
              <span className="font-mono text-devops-muted">
                {category.score}/{category.maxScore}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#22C55E,#38BDF8,#8B5CF6)]"
                style={{ width: `${Math.min(100, Math.max(0, category.percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
