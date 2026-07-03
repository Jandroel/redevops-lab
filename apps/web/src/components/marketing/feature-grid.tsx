import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "DevOps Maturity Score",
    body: "A clear score that summarizes readiness across automation, security, configuration, and operations.",
    tone: "green"
  },
  {
    title: "Production-ready Checklist",
    body: "Concrete missing practices that move a repository closer to a deployable baseline.",
    tone: "blue"
  },
  {
    title: "Hands-on Labs",
    body: "Practical exercises mapped to the actual repo, not generic tasks detached from the codebase.",
    tone: "violet"
  },
  {
    title: "Stack Detection",
    body: "Future analyzer rules will detect frameworks, package managers, databases, and infrastructure clues.",
    tone: "amber"
  },
  {
    title: "Learning Path",
    body: "A recommended sequence from foundation work to CI, security, observability, and deployment.",
    tone: "green"
  },
  {
    title: "Markdown Export",
    body: "Reports will be exportable as a developer-friendly document for issues, pull requests, or portfolios.",
    tone: "blue"
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
            Everything points toward a better repository.
          </h2>
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
