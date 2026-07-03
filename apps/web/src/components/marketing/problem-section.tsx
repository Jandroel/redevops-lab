export function ProblemSection() {
  return (
    <section className="border-b border-devops-border/70 bg-devops-bg">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-devops-green">
            Real repos, real practice
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            DevOps sticks when it is tied to code you can actually ship.
          </h2>
        </div>
        <div className="grid gap-4 text-base leading-8 text-devops-muted sm:grid-cols-2">
          <p>
            Tutorials teach isolated concepts. ReDevOps Lab starts from a repository and turns
            its current gaps into practical work.
          </p>
          <p>
            The product is built around analyzer rules and scoring evidence first, so future AI
            explanations stay grounded in what the repository really contains.
          </p>
        </div>
      </div>
    </section>
  );
}
