import type { DevOpsLab } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface LabCardProps {
  lab: DevOpsLab;
}

const difficultyTone: Record<DevOpsLab["difficulty"], "green" | "violet" | "amber"> = {
  beginner: "green",
  intermediate: "violet",
  advanced: "amber"
};

export function LabCard({ lab }: LabCardProps) {
  return (
    <article className="rounded-lg border border-devops-border bg-devops-surface/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{lab.title}</h3>
          <p className="mt-2 text-sm leading-6 text-devops-muted">{lab.objective}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={difficultyTone[lab.difficulty]}>{lab.difficulty}</Badge>
          {lab.category ? <Badge tone="slate">{lab.category}</Badge> : null}
          {lab.estimatedTime ? <Badge tone="blue">{lab.estimatedTime}</Badge> : null}
        </div>
      </div>
      <p className="mt-4 rounded-md border border-devops-border bg-slate-950/55 p-3 text-sm leading-6 text-devops-muted">
        {lab.whyItMatters}
      </p>
      {lab.steps.length ? (
        <ol className="mt-4 space-y-2 text-sm leading-6 text-devops-muted">
          {lab.steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[1.5rem_1fr] gap-2">
              <span className="font-mono text-xs text-sky-200">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {lab.suggestedFiles.map((file) => (
          <span
            key={file}
            className="max-w-full break-words rounded-md border border-devops-border bg-slate-950/75 px-2.5 py-1 font-mono text-xs text-devops-muted"
          >
            {file}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-devops-muted">
        <span className="font-semibold text-devops-text">Validation:</span> {lab.validation}
      </p>
    </article>
  );
}
