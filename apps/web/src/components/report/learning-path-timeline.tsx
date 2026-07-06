import type { LearningPathStep } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface LearningPathTimelineProps {
  steps: readonly LearningPathStep[];
}

const statusTone: Record<NonNullable<LearningPathStep["status"]>, "green" | "blue" | "violet"> = {
  completed: "green",
  recommended: "blue",
  optional: "violet"
};

export function LearningPathTimeline({ steps }: LearningPathTimelineProps) {
  return (
    <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Recommended DevOps path</h2>
        <Badge tone="blue">{steps.length} steps</Badge>
      </div>
      <div className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="grid grid-cols-[2rem_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-devops-blue/40 bg-devops-blue/10 font-mono text-xs text-sky-200">
                {step.order || index + 1}
              </span>
              {index < steps.length - 1 ? <span className="mt-2 h-full w-px bg-devops-border" /> : null}
            </div>
            <article className="pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{step.title}</h3>
                {step.status ? <Badge tone={statusTone[step.status]}>{step.status}</Badge> : null}
                {step.difficulty ? <Badge tone="slate">{step.difficulty}</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-devops-muted">{step.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {step.topics.slice(0, 4).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md border border-devops-border bg-devops-bg/70 px-2 py-1 text-xs text-devops-muted"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              {step.relatedFiles.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.relatedFiles.slice(0, 4).map((file) => (
                    <span
                      key={file}
                      className="max-w-full break-words rounded-md border border-devops-border bg-slate-950/75 px-2 py-1 font-mono text-[11px] text-devops-muted"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
