import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

const examples = [
  {
    name: "docker/awesome-compose",
    url: "https://github.com/docker/awesome-compose",
    description: "A public catalog of Compose samples that is useful for container and docs signals."
  },
  {
    name: "vercel/next.js",
    url: "https://github.com/vercel/next.js",
    description: "A large TypeScript framework repository with rich CI, docs, and package signals."
  },
  {
    name: "nestjs/nest",
    url: "https://github.com/nestjs/nest",
    description: "A mature backend framework repository that gives the analyzer a real project tree."
  }
] as const;

export default function ExamplesPage() {
  return (
    <section className="min-h-[calc(100svh-8rem)] bg-devops-bg">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="blue">Example repositories</Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">
            Test ReDevOps Lab with known public repositories.
          </h1>
          <p className="mt-5 leading-8 text-devops-muted">
            These examples are public GitHub repositories you can use to exercise the analyzer,
            compare report output, and inspect the demo experience.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {examples.map((example) => (
            <article
              key={example.name}
              className="rounded-lg border border-devops-border bg-devops-surface/75 p-6 panel-edge"
            >
              <p className="font-mono text-sm text-devops-green">{example.name}</p>
              <p className="mt-4 min-h-24 text-sm leading-6 text-devops-muted">
                {example.description}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={`/analyze?repo=${encodeURIComponent(example.url)}`}>
                  Analyze repository
                </ButtonLink>
                <ButtonLink href="/report/demo" variant="secondary">
                  View demo report
                </ButtonLink>
                <Link
                  href={example.url}
                  className="text-sm text-devops-muted transition hover:text-devops-text"
                >
                  Open on GitHub
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
