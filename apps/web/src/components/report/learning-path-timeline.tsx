interface LearningPathTimelineProps {
  steps: readonly string[];
}

export function LearningPathTimeline({ steps }: LearningPathTimelineProps) {
  return (
    <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <h2 className="text-xl font-semibold text-white">Recommended DevOps path</h2>
      <div className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <div key={step} className="grid grid-cols-[2rem_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-devops-blue/40 bg-devops-blue/10 font-mono text-xs text-sky-200">
                {index + 1}
              </span>
              {index < steps.length - 1 ? <span className="mt-2 h-full w-px bg-devops-border" /> : null}
            </div>
            <p className="pb-4 pt-1 text-devops-muted">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
