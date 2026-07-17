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
  const steps = lab.steps ?? [];
  const suggestedFiles = lab.suggestedFiles ?? [];
  const prerequisites = lab.prerequisites ?? [];
  const commands = lab.commands ?? [];
  const commonMistakes = lab.commonMistakes ?? [];
  const completionCriteria = lab.completionCriteria ?? [];
  const verificationChecklist = lab.verificationChecklist ?? [];
  const conceptIds = lab.conceptIds ?? [];
  const difficulty = lab.difficulty ?? "beginner";

  return (
    <article className="rounded-lg border border-devops-border bg-devops-surface/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{lab.title}</h3>
          <p className="mt-2 text-sm leading-6 text-devops-muted">
            <span className="font-semibold text-devops-text">Objective:</span> {lab.objective}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={difficultyTone[difficulty]}>{difficulty}</Badge>
          {lab.category ? <Badge tone="slate">{lab.category}</Badge> : null}
          {lab.estimatedTime ? <Badge tone="blue">{lab.estimatedTime}</Badge> : null}
        </div>
      </div>
      <div className="mt-4 rounded-md border border-devops-border bg-slate-950/55 p-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-devops-blue">
          Why it matters
        </p>
        <p className="mt-2 text-sm leading-6 text-devops-muted">
          {lab.whyItMatters ?? "This lab turns the repository finding into a practical improvement."}
        </p>
      </div>
      {conceptIds.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {conceptIds.map((conceptId) => (
            <span
              key={conceptId}
              className="rounded-full border border-devops-border bg-slate-950/60 px-2.5 py-1 text-xs text-devops-muted"
            >
              {conceptId}
            </span>
          ))}
        </div>
      ) : null}
      <LabList title="Before you start" items={prerequisites} />
      {steps.length ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-devops-text">Practice steps</p>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-devops-muted">
            {steps.map((step, index) => (
              <li key={step} className="grid grid-cols-[1.5rem_1fr] gap-2">
                <span className="font-mono text-xs text-sky-200">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {commands.length ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-devops-text">Commands to try</p>
          <div className="mt-3 space-y-2">
            {commands.map((command) => (
              <pre
                key={command}
                className="overflow-x-auto rounded-md border border-devops-border bg-devops-bg/90 p-3 text-xs leading-5 text-sky-100"
              >
                <code>{command}</code>
              </pre>
            ))}
          </div>
        </div>
      ) : null}
      {suggestedFiles.length ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-devops-text">Suggested files</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedFiles.map((file) => (
              <span
                key={file}
                className="max-w-full break-words rounded-md border border-devops-border bg-slate-950/75 px-2.5 py-1 font-mono text-xs text-devops-muted"
              >
                {file}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {lab.expectedOutcome ? (
        <div className="mt-4 rounded-md border border-devops-border bg-slate-950/55 p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-devops-green">
            Expected outcome
          </p>
          <p className="mt-2 text-sm leading-6 text-devops-muted">{lab.expectedOutcome}</p>
        </div>
      ) : null}
      <div className="mt-4 grid gap-3">
        <LabDetails title="Common mistakes" items={commonMistakes} />
        <LabDetails title="Completion criteria" items={completionCriteria} />
        <LabDetails title="Verification checklist" items={verificationChecklist} />
      </div>
      <div className="mt-4 rounded-md border border-devops-border bg-devops-bg/80 p-3 font-mono text-xs leading-5 text-devops-muted">
        <span className="text-devops-green">$ validate-lab</span>
        <br />
        <span>{lab.validation}</span>
      </div>
    </article>
  );
}

interface LabListProps {
  title: string;
  items: readonly string[];
}

function LabList({ title, items }: LabListProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-devops-text">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-devops-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-devops-blue" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LabDetails({ title, items }: LabListProps) {
  if (!items.length) {
    return null;
  }

  return (
    <details className="rounded-md border border-devops-border bg-slate-950/55 p-3">
      <summary className="cursor-pointer text-sm font-medium text-devops-text">{title}</summary>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-devops-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-devops-green" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
