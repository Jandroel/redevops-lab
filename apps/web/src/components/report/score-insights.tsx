import { Badge } from "@/components/ui/badge";

interface ScoreInsightsProps {
  strengths: readonly string[];
  weaknesses: readonly string[];
  nextBestActions: readonly string[];
}

export function ScoreInsights({ strengths, weaknesses, nextBestActions }: ScoreInsightsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <InsightPanel title="What is working" tone="green" items={strengths} />
      <InsightPanel title="Gaps to fix" tone="amber" items={weaknesses} />
      <InsightPanel title="Next best actions" tone="blue" items={nextBestActions} ordered />
    </section>
  );
}

interface InsightPanelProps {
  title: string;
  tone: "green" | "amber" | "blue";
  items: readonly string[];
  ordered?: boolean;
}

function InsightPanel({ title, tone, items, ordered = false }: InsightPanelProps) {
  const List = ordered ? "ol" : "ul";

  return (
    <article className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      {items.length ? (
        <List className="space-y-3 text-sm leading-6 text-devops-muted">
          {items.map((item) => (
            <li key={item} className={ordered ? "ml-5 list-decimal" : "flex gap-3"}>
              {ordered ? (
                item
              ) : (
                <>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-devops-green" />
                  <span>{item}</span>
                </>
              )}
            </li>
          ))}
        </List>
      ) : (
        <p className="text-sm text-devops-muted">
          No items available from the current report evidence.
        </p>
      )}
    </article>
  );
}
