import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "GitHub Repository Analyzer",
    body: "Reads public repository metadata and file-tree signals without cloning or modifying the repo.",
    tone: "green"
  },
  {
    title: "Rule-based DevOps Score",
    body: "Calculates maturity from detected evidence across CI/CD, containers, security, docs, and operations.",
    tone: "blue"
  },
  {
    title: "Production-ready Checklist",
    body: "Prioritizes missing practices with status, category, priority, and evidence for what to fix first.",
    tone: "violet"
  },
  {
    title: "Learning Path",
    body: "Turns score gaps into a sequenced DevOps roadmap that matches the repository and experience level.",
    tone: "amber"
  },
  {
    title: "Hands-on Labs",
    body: "Creates practical exercises with objective, steps, validation, estimated time, and suggested files.",
    tone: "green"
  },
  {
    title: "Optional AI Mentor",
    body: "Explains and prioritizes the deterministic report when enabled, with mock mode as the safe default.",
    tone: "blue"
  },
  {
    title: "Markdown Export",
    body: "Exports the report as a developer-friendly Markdown artifact for issues, pull requests, or portfolios.",
    tone: "violet"
  }
] as const;

export function FeatureGrid() {
  return (
    <section className="border-b border-devops-border/70 bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-devops-blue">
            Analyzer-first workflow
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Evidence first, mentor second, practical next steps always.
          </h2>
          <p className="mt-4 leading-8 text-devops-muted">
            The score is calculated from detected repository signals, not guessed by AI. The mentor
            layer only explains what the analyzer already found.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="panel-edge rounded-lg border border-devops-border bg-devops-surface/80 p-6"
            >
              <Badge tone={feature.tone}>{feature.title.split(" ")[0]}</Badge>
              <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 leading-7 text-devops-muted">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
