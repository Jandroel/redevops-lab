"use client";

import type { DevOpsConcept } from "@redevops-lab/shared";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ConceptGlossaryProps {
  concepts: readonly DevOpsConcept[];
}

const categoryTone: Record<DevOpsConcept["category"], "green" | "blue" | "violet" | "amber" | "slate"> = {
  general: "blue",
  configuration: "green",
  containerization: "blue",
  ci_cd: "violet",
  security: "amber",
  observability: "green",
  documentation: "slate",
  infrastructure: "violet"
};

export function ConceptGlossary({ concepts }: ConceptGlossaryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DevOpsConcept["category"] | "all">("all");
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(concepts.map((concept) => concept.category)))] as const,
    [concepts]
  );
  const filteredConcepts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return concepts.filter((concept) => {
      const matchesCategory = category === "all" || concept.category === category;
      const haystack = [
        concept.term,
        concept.shortDefinition,
        concept.beginnerExplanation,
        concept.whyItMatters,
        concept.example,
        concept.relatedTerms.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, concepts, query]);

  if (!concepts.length) {
    return (
      <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
        <h2 className="text-xl font-semibold text-white">Concept glossary</h2>
        <p className="mt-2 text-sm leading-6 text-devops-muted">
          No glossary terms were generated for this report yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Concept glossary</h2>
            <Badge tone="blue">{concepts.length} terms</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-devops-muted">
            Search a term before starting a lab. Each definition is tied to the current report so
            the vocabulary stays practical.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search CI, Docker, health..."
          className="h-11 w-full rounded-md border border-devops-border bg-devops-bg px-4 text-sm text-devops-text outline-none transition placeholder:text-devops-muted focus:border-devops-blue focus:ring-2 focus:ring-devops-blue/30 lg:max-w-sm"
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
              category === item
                ? "border-devops-blue/70 bg-devops-blue/15 text-sky-100"
                : "border-devops-border bg-devops-bg/70 text-devops-muted hover:border-devops-blue/50 hover:text-devops-text"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filteredConcepts.map((concept) => (
          <article
            key={concept.id}
            className="rounded-md border border-devops-border bg-devops-bg/80 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{concept.term}</h3>
                <p className="mt-2 text-sm leading-6 text-devops-muted">
                  {concept.shortDefinition}
                </p>
              </div>
              <Badge tone={categoryTone[concept.category]}>{concept.category}</Badge>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-devops-muted">
              <p>
                <span className="font-semibold text-devops-text">In plain words:</span>{" "}
                {concept.beginnerExplanation}
              </p>
              <p>
                <span className="font-semibold text-devops-text">Why it matters:</span>{" "}
                {concept.whyItMatters}
              </p>
              <p className="rounded-md border border-devops-border bg-slate-950/55 p-3 font-mono text-xs">
                {concept.example}
              </p>
            </div>
            {concept.relatedTerms.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {concept.relatedTerms.map((term) => (
                  <span
                    key={term}
                    className="rounded-full border border-devops-border bg-slate-950/60 px-2.5 py-1 text-xs text-devops-muted"
                  >
                    {term}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {!filteredConcepts.length ? (
        <p className="mt-5 rounded-md border border-devops-border bg-devops-bg/70 p-4 text-sm text-devops-muted">
          No concepts match the current search.
        </p>
      ) : null}
    </section>
  );
}
