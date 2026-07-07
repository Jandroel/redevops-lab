import type { DetectedStackItem } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface RepoOverviewCardProps {
  repository: string;
  url: string;
  stack: readonly DetectedStackItem[];
  metadata?: {
    defaultBranch?: string;
    stars?: number;
    forks?: number;
    pushedAt?: string | null;
    analyzedItems?: number;
  };
}

export function RepoOverviewCard({ repository, url, stack, metadata }: RepoOverviewCardProps) {
  return (
    <section className="min-w-0 rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-sm text-devops-green">Analyzed repository</p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-white">{repository}</h2>
          <a href={url} className="mt-2 block break-all text-sm text-devops-blue hover:text-sky-200">
            {url}
          </a>
        </div>
        <Badge tone="green">Foundation</Badge>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {stack.map((item) => (
          <Badge key={`${item.category}-${item.name}`} tone="slate">
            {item.name}
          </Badge>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 text-sm sm:grid-cols-4">
        {[
          ["Branch", metadata?.defaultBranch ?? "unknown"],
          ["Stars", metadata?.stars?.toLocaleString() ?? "unknown"],
          ["Forks", metadata?.forks?.toLocaleString() ?? "unknown"],
          ["Files", metadata?.analyzedItems?.toLocaleString() ?? "unknown"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-devops-border bg-slate-950/55 p-3">
            <p className="text-xs text-devops-muted">{label}</p>
            <p className="mt-1 truncate font-mono text-devops-text">{value}</p>
          </div>
        ))}
      </div>
      {metadata?.pushedAt ? (
        <p className="mt-4 font-mono text-xs text-devops-muted">Last pushed: {metadata.pushedAt}</p>
      ) : null}
    </section>
  );
}
