import { Badge } from "@/components/ui/badge";

interface LabCardProps {
  title: string;
  difficulty: string;
  objective: string;
  files: readonly string[];
}

export function LabCard({ title, difficulty, objective, files }: LabCardProps) {
  return (
    <article className="rounded-lg border border-devops-border bg-devops-surface/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <Badge tone={difficulty === "Intermediate" ? "violet" : "green"}>{difficulty}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-devops-muted">{objective}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {files.map((file) => (
          <span
            key={file}
            className="rounded-md border border-devops-border bg-slate-950/75 px-2.5 py-1 font-mono text-xs text-devops-muted"
          >
            {file}
          </span>
        ))}
      </div>
    </article>
  );
}
