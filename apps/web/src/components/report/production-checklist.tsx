import type { ChecklistItemStatus, ProductionChecklistItem } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface ProductionChecklistProps {
  items: readonly ProductionChecklistItem[];
}

const statusTone: Record<ChecklistItemStatus, "green" | "red" | "blue"> = {
  done: "green",
  missing: "red",
  recommended: "blue"
};

const priorityTone: Record<ProductionChecklistItem["priority"], "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red"
};

export function ProductionChecklist({ items }: ProductionChecklistProps) {
  const priorityRank: Record<ProductionChecklistItem["priority"], number> = {
    high: 0,
    medium: 1,
    low: 2
  };
  const sortedItems = [...items].sort((left, right) => {
    if (left.status === "done" && right.status !== "done") {
      return 1;
    }

    if (left.status !== "done" && right.status === "done") {
      return -1;
    }

    return priorityRank[left.priority] - priorityRank[right.priority];
  });

  return (
    <section className="rounded-lg border border-devops-border bg-devops-surface/70 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Production-ready checklist</h2>
          <p className="mt-2 text-sm leading-6 text-devops-muted">
            Start with high-priority missing items, then move through recommended improvements.
          </p>
        </div>
        <Badge tone="blue">{items.length} checks</Badge>
      </div>

      {items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-devops-border bg-slate-950/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-devops-muted">{item.description}</p>
                </div>
                <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${
                    item.status === "done"
                      ? "border-devops-green/40 bg-devops-green/10 text-devops-green"
                      : item.status === "missing"
                        ? "border-devops-red/40 bg-devops-red/10 text-devops-red"
                        : "border-devops-blue/40 bg-devops-blue/10 text-devops-blue"
                  }`}
                >
                  {item.status === "done" ? "+" : item.status === "missing" ? "!" : "~"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={statusTone[item.status]}>{item.status}</Badge>
                <Badge tone={priorityTone[item.priority]}>{item.priority}</Badge>
                <Badge tone="slate">{item.category}</Badge>
              </div>
              {item.evidence.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.evidence.slice(0, 4).map((evidence) => (
                    <span
                      key={evidence}
                      className="max-w-full break-words rounded-md border border-devops-border bg-devops-bg/70 px-2 py-1 font-mono text-[11px] text-devops-muted"
                    >
                      {evidence}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-devops-muted">No checklist items available.</p>
      )}
    </section>
  );
}
