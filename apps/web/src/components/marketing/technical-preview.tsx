import { Badge } from "@/components/ui/badge";

const lines = [
  "$ redevops analyze https://github.com/Jandroel/redevops-lab",
  "Detected stack: Next.js, NestJS, TypeScript, Docker",
  "DevOps Score: 42/100 from repository evidence",
  "Missing signal: security scanning workflow",
  "Next action: add a workflow that runs lint, typecheck and build"
] as const;

const signals = [
  ["CI/CD", "detected", "green"],
  ["Dockerfile", "missing", "amber"],
  ["Security", "missing", "amber"],
  ["Deployment docs", "detected", "green"]
] as const;

export function TechnicalPreview() {
  return (
    <section className="border-b border-devops-border/70 bg-devops-bg">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="min-w-0 rounded-lg border border-devops-border bg-slate-950 panel-edge">
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
          <div className="grid gap-4 border-t border-devops-border p-5 md:grid-cols-[0.7fr_1fr]">
            <div className="rounded-lg border border-devops-border bg-devops-surface/70 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-devops-blue">
                Score
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-semibold text-white">42</span>
                <span className="pb-2 font-mono text-sm text-devops-muted">/100</span>
              </div>
              <p className="mt-3 text-sm text-devops-muted">Foundation maturity</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {signals.map(([label, status, tone]) => (
                <div
                  key={label}
                  className="rounded-lg border border-devops-border bg-devops-surface/70 p-3"
                >
                  <p className="text-sm font-medium text-white">{label}</p>
                  <Badge tone={tone} className="mt-3">
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <Badge tone="green">Product preview</Badge>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
            One dashboard for score, gaps, checklist, path, labs, and mentor notes.
          </h2>
          <p className="mt-5 leading-8 text-devops-muted">
            The report is designed for action: what exists, what is missing, why it matters, and
            which lab should come next.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["7", "Score categories"],
              ["10+", "Checklist checks"],
              ["4-8", "Hands-on labs"]
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-devops-border bg-devops-surface/70 p-4"
              >
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
