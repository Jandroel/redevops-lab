import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { RepositoryAnalyzerForm } from "@/components/marketing/repository-analyzer-form";

const badges = [
  "GitHub Analyzer",
  "DevOps Score",
  "AI Mentor",
  "Hands-on Labs",
  "Markdown Export"
];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-devops-border/70">
      <div className="absolute inset-0 -z-20 tech-grid opacity-55" />
      <div className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[68%] bg-[url('/images/hero-devops-lab.svg')] bg-cover bg-center opacity-60 lg:block" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#050A0F_0%,rgba(5,10,15,0.88)_42%,rgba(5,10,15,0.18)_100%)]" />

      <div className="mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={badge} tone={index % 3 === 0 ? "green" : index % 3 === 1 ? "blue" : "violet"}>
                {badge}
              </Badge>
            ))}
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Turn any GitHub repository into a DevOps learning lab.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-devops-muted sm:text-xl">
            Analyze real repositories, uncover DevOps gaps, calculate a maturity score, and get a
            personalized path to become production-ready.
          </p>
          <div className="mt-8 max-w-3xl">
            <RepositoryAnalyzerForm />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/analyze" variant="secondary">
              Open analyzer
            </ButtonLink>
            <ButtonLink href="/report/demo" variant="ghost">
              View demo report
            </ButtonLink>
            <ButtonLink href="/examples" variant="ghost">
              Example repos
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
