import { ButtonLink } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-slate-950/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-devops-green">
            Start with any public GitHub repository
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            Build a DevOps learning plan from real code.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/analyze" size="lg">
            Generate DevOps Lab
          </ButtonLink>
          <ButtonLink href="/report/demo" variant="secondary" size="lg">
            View demo report
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
