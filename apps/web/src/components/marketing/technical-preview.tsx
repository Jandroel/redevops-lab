import { Badge } from "@/components/ui/badge";

const lines = [
  "$ redevops analyze https://github.com/Jandroel/redevops-lab",
  "Detected stack: Next.js, NestJS, TypeScript, PostgreSQL, Docker",
  "DevOps Score: calculated from repository evidence",
  "Missing: production Docker, security scanning, observability depth",
  "Next best action: add a Dockerfile and dependency scanning"
];

export function TechnicalPreview() {
  return (
    <section className="border-b border-devops-border/70 bg-devops-bg">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="rounded-lg border border-devops-border bg-slate-950 panel-edge">
          <div className="flex items-center justify-between border-b border-devops-border px-5 py-4">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-devops-red" />
              <span className="h-3 w-3 rounded-full bg-devops-amber" />
              <span className="h-3 w-3 rounded-full bg-devops-green" />
            </div>
            <span className="font-mono text-xs text-devops-muted">analysis.run</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-devops-text">
            {lines.map((line) => (
              <code key={line} className="block">
                {line}
              </code>
            ))}
          </pre>
        </div>
        <div className="flex flex-col justify-center">
          <Badge tone="green">Technical preview</Badge>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
            A report shaped for builders.
          </h2>
          <p className="mt-5 leading-8 text-devops-muted">
            ReDevOps Lab turns repository evidence into a score, gaps, and labs that can become
            issues, pull requests, or portfolio milestones.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["100", "Points"],
              ["6", "Categories"],
              ["5", "Labs"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-devops-border bg-devops-surface/70 p-4">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-sm text-devops-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
