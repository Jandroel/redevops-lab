"use client";

import type {
  DevOpsConcept,
  DevOpsLab,
  DevOpsLearningModule,
  ProductionChecklistItem
} from "@redevops-lab/shared";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BeginnerJourneyProps {
  reportId: string;
  modules: readonly DevOpsLearningModule[];
  concepts: readonly DevOpsConcept[];
  labs: readonly DevOpsLab[];
  checklist: readonly ProductionChecklistItem[];
}

const categoryTone: Record<DevOpsLearningModule["category"], "green" | "blue" | "violet" | "amber" | "slate"> = {
  general: "blue",
  configuration: "green",
  containerization: "blue",
  ci_cd: "violet",
  security: "amber",
  observability: "green",
  documentation: "slate",
  infrastructure: "violet"
};

const flow = [
  {
    title: "Read signals",
    text: "Start from repository evidence, not guesses."
  },
  {
    title: "Understand gaps",
    text: "Translate missing signals into beginner concepts."
  },
  {
    title: "Practice safely",
    text: "Use a lab to make one small, reviewable change."
  },
  {
    title: "Validate",
    text: "Run checks or document why a check is pending."
  },
  {
    title: "Re-analyze",
    text: "Run the report again and compare evidence."
  }
];

export function BeginnerJourney({
  reportId,
  modules,
  concepts,
  labs,
  checklist
}: BeginnerJourneyProps) {
  const [selectedId, setSelectedId] = useState(modules[0]?.id ?? "");
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const storageKey = `redevops-learning-progress:${reportId}`;

  useEffect(() => {
    setSelectedId((current) => current || modules[0]?.id || "");
  }, [modules]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setCompletedIds(raw ? JSON.parse(raw) : []);
    } catch {
      setCompletedIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(completedIds));
    } catch {
      // Local progress is optional; the report remains usable if storage is blocked.
    }
  }, [completedIds, storageKey]);

  const conceptById = useMemo(
    () => new Map(concepts.map((concept) => [concept.id, concept])),
    [concepts]
  );
  const labById = useMemo(() => new Map(labs.map((lab) => [lab.id, lab])), [labs]);
  const checklistById = useMemo(
    () => new Map(checklist.map((item) => [item.id, item])),
    [checklist]
  );
  const selected = modules.find((module) => module.id === selectedId) ?? modules[0];
  const completedCount = modules.filter((module) => completedIds.includes(module.id)).length;
  const progress = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;

  function toggleCompleted(moduleId: string) {
    setCompletedIds((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
  }

  if (!modules.length) {
    return (
      <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
        <h2 className="text-xl font-semibold text-white">Beginner learning journey</h2>
        <p className="mt-2 text-sm leading-6 text-devops-muted">
          This report does not include learning modules yet. Use the checklist and labs below as
          the starting point.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Beginner learning journey</h2>
            <Badge tone="blue">{modules.length} modules</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-devops-muted">
            Follow this map to understand terms, practice one improvement at a time, and validate
            evidence before moving to the next DevOps topic.
          </p>
        </div>
        <div className="min-w-56 rounded-md border border-devops-border bg-devops-bg/80 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-devops-muted">Learning progress</span>
            <span className="font-mono text-devops-blue">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-devops-green" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-devops-muted">
            {completedCount}/{modules.length} modules marked understood on this device.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {flow.map((step, index) => (
          <div key={step.title} className="rounded-md border border-devops-border bg-devops-bg/80 p-3">
            <span className="font-mono text-xs text-devops-green">0{index + 1}</span>
            <h3 className="mt-2 text-sm font-semibold text-devops-text">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 text-devops-muted">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          {modules.map((module) => {
            const isSelected = module.id === selected?.id;
            const isCompleted = completedIds.includes(module.id);

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setSelectedId(module.id)}
                className={`w-full rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
                  isSelected
                    ? "border-devops-blue/70 bg-devops-blue/10"
                    : "border-devops-border bg-devops-bg/65 hover:border-devops-blue/50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-white">{module.title}</span>
                  <span className="flex items-center gap-2">
                    {isCompleted ? <Badge tone="green">understood</Badge> : null}
                    <Badge tone={categoryTone[module.category]}>{module.category}</Badge>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-devops-muted">{module.summary}</p>
              </button>
            );
          })}
        </div>

        {selected ? (
          <article className="rounded-md border border-devops-border bg-devops-bg/80 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge tone={categoryTone[selected.category]}>{selected.estimatedTime}</Badge>
                <h3 className="mt-3 text-2xl font-semibold text-white">{selected.title}</h3>
                <p className="mt-2 text-sm leading-6 text-devops-muted">{selected.beginnerGoal}</p>
              </div>
              <Button
                type="button"
                variant={completedIds.includes(selected.id) ? "secondary" : "primary"}
                onClick={() => toggleCompleted(selected.id)}
              >
                {completedIds.includes(selected.id) ? "Mark as active" : "Mark understood"}
              </Button>
            </div>

            <div className="mt-5 rounded-md border border-devops-border bg-slate-950/55 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-devops-blue">
                Why this is next
              </p>
              <p className="mt-2 text-sm leading-6 text-devops-muted">{selected.whyNow}</p>
              <p className="mt-3 text-sm leading-6 text-devops-muted">
                <span className="font-semibold text-devops-text">Outcome:</span> {selected.outcome}
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <RelatedList
                title="Concepts to learn"
                items={selected.concepts.map((id) => conceptById.get(id)?.term ?? id)}
              />
              <RelatedList
                title="Labs to practice"
                items={selected.labs.map((id) => labById.get(id)?.title ?? id)}
              />
              <RelatedList
                title="Checklist evidence"
                items={selected.checklistItems.map((id) => checklistById.get(id)?.title ?? id)}
              />
              <RelatedList
                title="Suggested flow"
                items={["Read concepts", "Open related lab", "Make one branch", "Validate and re-run report"]}
              />
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

interface RelatedListProps {
  title: string;
  items: readonly string[];
}

function RelatedList({ title, items }: RelatedListProps) {
  return (
    <div className="rounded-md border border-devops-border bg-slate-950/55 p-4">
      <h4 className="text-sm font-semibold text-devops-text">{title}</h4>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-devops-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-devops-green" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-devops-muted">No linked items in this report.</p>
      )}
    </div>
  );
}
