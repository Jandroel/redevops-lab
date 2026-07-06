const steps = [
  {
    title: "Paste a public GitHub repo",
    body: "Start with a URL. ReDevOps Lab validates the repository format and sends it to the backend analyzer."
  },
  {
    title: "Detect repository signals",
    body: "The API reads metadata and file-tree evidence for CI/CD, Docker, configuration, security, docs, and operations."
  },
  {
    title: "Get a maturity score",
    body: "Scoring rules convert detected facts into category scores, strengths, weaknesses, and next best actions."
  },
  {
    title: "Follow the lab roadmap",
    body: "The report turns gaps into a checklist, learning path, hands-on labs, and optional mentor guidance."
  }
] as const;

export function ProblemSection() {
  return (
    <section className="border-b border-devops-border/70 bg-devops-bg">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-devops-green">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              A report built from repository facts.
            </h2>
            <p className="mt-5 leading-8 text-devops-muted">
              ReDevOps Lab is deterministic at the core. AI can explain the roadmap, but the
              analyzer, score, checklist, and labs stay grounded in visible evidence.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-devops-border bg-devops-surface/75 p-5"
              >
                <span className="font-mono text-sm text-devops-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-devops-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
