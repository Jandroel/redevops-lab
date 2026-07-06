import type { DevOpsSignal } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface RepositorySignalsProps {
  signals: readonly DevOpsSignal[];
}

export function RepositorySignals({ signals }: RepositorySignalsProps) {
  return (
    <section className="rounded-lg border border-devops-border bg-devops-surface/70 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Repository Signals</h2>
        <Badge tone="blue">{signals.filter((signal) => signal.detected).length} detected</Badge>
      </div>
      {signals.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {signals.map((signal) => (
            <article
              key={signal.key}
              className="rounded-lg border border-devops-border bg-slate-950/55 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">{signal.label}</h3>
                <Badge tone={signal.detected ? "green" : "amber"}>
                  {signal.detected ? "Detected" : "Missing"}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-devops-muted">{signal.description}</p>
              {signal.files.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {signal.files.slice(0, 3).map((file) => (
                    <span
                      key={file}
                      className="max-w-full break-words rounded-md border border-devops-border bg-slate-950/75 px-2 py-1 font-mono text-xs text-devops-muted"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-devops-muted">No repository signal data is available yet.</p>
      )}
    </section>
  );
}
