"use client";

import type {
  DevOpsConcept,
  GuidedLearningMission,
  LearningEvidenceLevel,
  ReportLanguage
} from "@redevops-lab/shared";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ExternalLink,
  FileCode2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Search,
  Terminal,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BeginnerJourneyProps {
  reportId: string;
  repositoryUrl: string;
  language: ReportLanguage;
  missions: readonly GuidedLearningMission[];
  concepts: readonly DevOpsConcept[];
}

interface JourneyProgress {
  completedMissionIds: string[];
  completedStepIds: string[];
  quizAnswers: Record<string, string>;
}

const emptyProgress: JourneyProgress = {
  completedMissionIds: [],
  completedStepIds: [],
  quizAnswers: {}
};

const categoryTone: Record<
  GuidedLearningMission["category"],
  "green" | "blue" | "violet" | "amber" | "slate"
> = {
  general: "blue",
  configuration: "green",
  containerization: "blue",
  ci_cd: "violet",
  security: "amber",
  observability: "green",
  documentation: "slate",
  infrastructure: "violet"
};

const evidenceTone: Record<LearningEvidenceLevel, "green" | "amber" | "slate"> = {
  confirmed: "green",
  inferred: "amber",
  "needs-review": "slate"
};

export function BeginnerJourney({
  reportId,
  repositoryUrl,
  language,
  missions,
  concepts
}: BeginnerJourneyProps) {
  const isSpanish = language === "es";
  const [selectedId, setSelectedId] = useState(missions[0]?.id ?? "");
  const [progress, setProgress] = useState<JourneyProgress>(emptyProgress);
  const [loadedStorageKey, setLoadedStorageKey] = useState("");
  const [completedNow, setCompletedNow] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const storageKey = `redevops-guided-progress:${reportId}`;

  useEffect(() => {
    let nextProgress = emptyProgress;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<JourneyProgress> | string[];
        nextProgress = Array.isArray(stored)
          ? { ...emptyProgress, completedMissionIds: stored }
          : {
              completedMissionIds: stored.completedMissionIds ?? [],
              completedStepIds: stored.completedStepIds ?? [],
              quizAnswers: stored.quizAnswers ?? {}
            };
      }
    } catch {
      nextProgress = emptyProgress;
    }

    setProgress(nextProgress);
    setLoadedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // Learning progress is optional when browser storage is unavailable.
    }
  }, [loadedStorageKey, progress, storageKey]);

  useEffect(() => {
    setSelectedId((current) => current || missions[0]?.id || "");
  }, [missions]);

  const conceptById = useMemo(
    () => new Map(concepts.map((concept) => [concept.id, concept])),
    [concepts]
  );
  const selected = missions.find((mission) => mission.id === selectedId) ?? missions[0];
  const completedCount = missions.filter((mission) =>
    progress.completedMissionIds.includes(mission.id)
  ).length;
  const progressPercentage = missions.length
    ? Math.round((completedCount / missions.length) * 100)
    : 0;
  const selectedAnswerId = selected ? progress.quizAnswers[selected.id] : undefined;
  const selectedAnswer = selected?.knowledgeCheck.options.find(
    (option) => option.id === selectedAnswerId
  );
  const allStepsComplete = selected
    ? selected.steps.every((step) => progress.completedStepIds.includes(step.id))
    : false;
  const canComplete = Boolean(allStepsComplete && selectedAnswer?.correct);

  function selectMission(missionId: string) {
    setSelectedId(missionId);
    setCompletedNow(null);
    setResetArmed(false);
  }

  function toggleStep(stepId: string) {
    setProgress((current) => ({
      ...current,
      completedStepIds: current.completedStepIds.includes(stepId)
        ? current.completedStepIds.filter((id) => id !== stepId)
        : [...current.completedStepIds, stepId]
    }));
  }

  function answerQuestion(optionId: string) {
    if (!selected) {
      return;
    }

    setProgress((current) => ({
      ...current,
      quizAnswers: { ...current.quizAnswers, [selected.id]: optionId }
    }));
  }

  function completeMission() {
    if (!selected || !canComplete) {
      return;
    }

    setProgress((current) => ({
      ...current,
      completedMissionIds: current.completedMissionIds.includes(selected.id)
        ? current.completedMissionIds
        : [...current.completedMissionIds, selected.id]
    }));
    setCompletedNow(selected.id);
  }

  function moveToNextMission() {
    if (!selected) {
      return;
    }

    const currentIndex = missions.findIndex((mission) => mission.id === selected.id);
    const next =
      missions[currentIndex + 1] ??
      missions.find((mission) => !progress.completedMissionIds.includes(mission.id));

    if (next) {
      selectMission(next.id);
    }
  }

  function resetProgress() {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }

    setProgress(emptyProgress);
    setCompletedNow(null);
    setResetArmed(false);
    setSelectedId(missions[0]?.id ?? "");
  }

  if (!missions.length) {
    return (
      <section className="border-y border-devops-border py-10">
        <h2 className="text-2xl font-semibold text-white">
          {isSpanish
            ? "Tu ruta guiada aun no esta disponible"
            : "Your guided path is not available yet"}
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-devops-muted">
          {isSpanish
            ? "Vuelve a analizar el repositorio para generar misiones con el motor de aprendizaje actual."
            : "Analyze the repository again to generate missions with the current learning engine."}
        </p>
        <Link
          href={`/analyze?repo=${encodeURIComponent(repositoryUrl)}`}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-devops-green/70 bg-devops-green px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-devops-blue/70"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          {isSpanish ? "Volver a analizar" : "Analyze again"}
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="guided-learning-title">
      <div className="flex flex-col gap-5 border-b border-devops-border pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-devops-green">
            <BookOpen aria-hidden="true" className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-[0.16em]">
              {isSpanish ? "Aprender haciendo" : "Learn by doing"}
            </span>
          </div>
          <h2 id="guided-learning-title" className="mt-3 text-3xl font-semibold text-white">
            {isSpanish ? "Tu entrenador DevOps, paso a paso" : "Your DevOps coach, step by step"}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-devops-muted">
            {isSpanish
              ? "No necesitas entender todo el reporte. Completa una mision, comprueba lo aprendido y vuelve a analizar para ver el cambio."
              : "You do not need to understand the whole report. Complete one mission, check what you learned, and analyze again to see the change."}
          </p>
        </div>
        <div className="min-w-64">
          <div className="flex items-center justify-between text-sm">
            <span className="text-devops-muted">
              {isSpanish ? "Progreso de la ruta" : "Path progress"}
            </span>
            <span className="font-mono text-devops-green">
              {completedCount}/{missions.length}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-devops-green transition-[width] duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <button
            type="button"
            onClick={resetProgress}
            onBlur={() => setResetArmed(false)}
            className="mt-3 inline-flex items-center gap-2 text-xs text-devops-muted transition hover:text-white focus:outline-none focus:ring-2 focus:ring-devops-blue/70"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            {resetArmed
              ? isSpanish
                ? "Pulsa otra vez para confirmar"
                : "Press again to confirm"
              : isSpanish
                ? "Reiniciar progreso local"
                : "Reset local progress"}
          </button>
        </div>
      </div>

      <div className="mt-7 grid min-w-0 gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <nav aria-label={isSpanish ? "Misiones de aprendizaje" : "Learning missions"}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-devops-muted">
            {isSpanish ? "Tu ruta recomendada" : "Your recommended path"}
          </p>
          <ol className="mt-3 space-y-1">
            {missions.map((mission) => {
              const isSelected = mission.id === selected?.id;
              const isComplete = progress.completedMissionIds.includes(mission.id);

              return (
                <li key={mission.id}>
                  <button
                    type="button"
                    onClick={() => selectMission(mission.id)}
                    aria-current={isSelected ? "step" : undefined}
                    className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_1rem] items-center gap-3 border-l-2 px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
                      isSelected
                        ? "border-devops-green bg-devops-green/8 text-white"
                        : "border-devops-border text-devops-muted hover:border-devops-blue hover:bg-slate-950/45 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                        isComplete
                          ? "border-devops-green bg-devops-green text-slate-950"
                          : isSelected
                            ? "border-devops-green text-devops-green"
                            : "border-devops-border"
                      }`}
                    >
                      {isComplete ? (
                        <Check aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        mission.order
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-devops-muted">
                        {isSpanish ? `Mision ${mission.order}` : `Mission ${mission.order}`}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold leading-5">
                        {mission.title}
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {selected ? (
          <div className="min-w-0">
            {completedNow === selected.id ? (
              <div
                className="mb-7 border border-devops-green/45 bg-devops-green/8 p-5"
                role="status"
              >
                <div className="flex gap-4">
                  <Trophy
                    aria-hidden="true"
                    className="mt-0.5 h-6 w-6 shrink-0 text-devops-green"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {isSpanish ? "Mision completada" : "Mission complete"}
                    </h3>
                    <p className="mt-2 leading-6 text-devops-muted">{selected.completionMessage}</p>
                    {completedCount < missions.length ? (
                      <Button type="button" className="mt-4" onClick={moveToNextMission}>
                        {isSpanish ? "Continuar con la siguiente" : "Continue to the next one"}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Link
                        href={`/analyze?repo=${encodeURIComponent(repositoryUrl)}`}
                        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-devops-green/70 bg-devops-green px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-devops-blue/70"
                      >
                        <RotateCcw aria-hidden="true" className="h-4 w-4" />
                        {isSpanish ? "Volver a analizar y comparar" : "Analyze again and compare"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <header className="flex flex-col gap-4 border-b border-devops-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={categoryTone[selected.category]}>{selected.category}</Badge>
                  <Badge tone="blue">{selected.estimatedTime}</Badge>
                  <Badge tone={evidenceTone[selected.evidenceLevel]}>
                    {evidenceLabel(selected.evidenceLevel, language)}
                  </Badge>
                </div>
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-devops-green">
                  {isSpanish
                    ? `Mision ${selected.order} de ${missions.length}`
                    : `Mission ${selected.order} of ${missions.length}`}
                </p>
                <h3 className="mt-2 text-3xl font-semibold text-white">{selected.title}</h3>
                <p className="mt-3 max-w-3xl text-lg leading-8 text-devops-muted">
                  {selected.plainLanguageGoal}
                </p>
              </div>
            </header>

            <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="min-w-0 space-y-8">
                <section aria-labelledby={`${selected.id}-why`}>
                  <div className="flex items-center gap-2 text-devops-blue">
                    <Lightbulb aria-hidden="true" className="h-5 w-5" />
                    <h4 id={`${selected.id}-why`} className="font-semibold text-white">
                      {isSpanish
                        ? "Primero, entiende el problema"
                        : "First, understand the problem"}
                    </h4>
                  </div>
                  <p className="mt-3 leading-7 text-devops-muted">{selected.summary}</p>
                  <p className="mt-3 border-l-2 border-devops-blue pl-4 leading-7 text-devops-text">
                    {selected.whyNow}
                  </p>
                </section>

                <section aria-labelledby={`${selected.id}-steps`}>
                  <div className="flex items-center gap-2 text-devops-green">
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                    <h4 id={`${selected.id}-steps`} className="font-semibold text-white">
                      {isSpanish ? "Hazlo en pasos pequenos" : "Do it in small steps"}
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-devops-muted">
                    {isSpanish
                      ? "Marca cada paso despues de realizarlo en tu propia rama."
                      : "Mark each step after doing it in your own branch."}
                  </p>
                  <ol className="mt-4 space-y-3">
                    {selected.steps.map((step, index) => {
                      const checked = progress.completedStepIds.includes(step.id);

                      return (
                        <li key={step.id}>
                          <button
                            type="button"
                            onClick={() => toggleStep(step.id)}
                            className={`grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-3 border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
                              checked
                                ? "border-devops-green/45 bg-devops-green/8"
                                : "border-devops-border bg-slate-950/40 hover:border-devops-blue/55"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${
                                checked
                                  ? "border-devops-green bg-devops-green text-slate-950"
                                  : "border-devops-border text-devops-muted"
                              }`}
                            >
                              {checked ? (
                                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </span>
                            <span>
                              <span className="block font-semibold text-white">{step.title}</span>
                              <span className="mt-1 block text-sm leading-6 text-devops-muted">
                                {step.instruction}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                {selected.commands.length ? (
                  <section aria-labelledby={`${selected.id}-commands`}>
                    <div className="flex items-center gap-2 text-devops-blue">
                      <Terminal aria-hidden="true" className="h-5 w-5" />
                      <h4 id={`${selected.id}-commands`} className="font-semibold text-white">
                        {isSpanish ? "Comandos para comprobar" : "Commands to verify"}
                      </h4>
                    </div>
                    <div className="mt-4 space-y-2">
                      {selected.commands.map((command) => (
                        <pre
                          key={command}
                          className="overflow-x-auto border border-devops-border bg-devops-bg p-4 text-xs leading-5 text-sky-100"
                        >
                          <code>{command}</code>
                        </pre>
                      ))}
                    </div>
                  </section>
                ) : null}

                <KnowledgeCheck
                  mission={selected}
                  language={language}
                  selectedAnswerId={selectedAnswerId}
                  onAnswer={answerQuestion}
                />

                <section className="border-t border-devops-border pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {isSpanish ? "Criterio para terminar" : "Definition of done"}
                      </p>
                      <p className="mt-1 text-sm text-devops-muted">
                        {isSpanish
                          ? "Completa los pasos y responde correctamente la comprobacion."
                          : "Complete the steps and answer the knowledge check correctly."}
                      </p>
                    </div>
                    <Button type="button" disabled={!canComplete} onClick={completeMission}>
                      <Trophy aria-hidden="true" className="h-4 w-4" />
                      {isSpanish ? "Completar mision" : "Complete mission"}
                    </Button>
                  </div>
                </section>
              </div>

              <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                <EvidencePanel mission={selected} language={language} />

                {selected.conceptIds.length ? (
                  <div className="border-t border-devops-border pt-5">
                    <div className="flex items-center gap-2">
                      <HelpCircle aria-hidden="true" className="h-4 w-4 text-devops-violet" />
                      <h4 className="text-sm font-semibold text-white">
                        {isSpanish
                          ? "Terminos que pueden confundirte"
                          : "Terms that may be confusing"}
                      </h4>
                    </div>
                    <div className="mt-3 space-y-2">
                      {selected.conceptIds.map((conceptId) => {
                        const concept = conceptById.get(conceptId);
                        if (!concept) {
                          return null;
                        }

                        return (
                          <details
                            key={concept.id}
                            className="border border-devops-border bg-slate-950/40 p-3"
                          >
                            <summary className="cursor-pointer text-sm font-semibold text-devops-text focus:outline-none focus:ring-2 focus:ring-devops-blue/70">
                              {concept.term}
                            </summary>
                            <p className="mt-3 text-sm leading-6 text-devops-muted">
                              {concept.beginnerExplanation}
                            </p>
                            <p className="mt-3 font-mono text-xs leading-5 text-sky-200">
                              {concept.example}
                            </p>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {selected.suggestedFiles.length ? (
                  <div className="border-t border-devops-border pt-5">
                    <div className="flex items-center gap-2">
                      <FileCode2 aria-hidden="true" className="h-4 w-4 text-devops-blue" />
                      <h4 className="text-sm font-semibold text-white">
                        {isSpanish ? "Archivos que vas a tocar" : "Files you may touch"}
                      </h4>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {selected.suggestedFiles.map((file) => (
                        <li
                          key={file}
                          className="break-words font-mono text-xs leading-5 text-devops-muted"
                        >
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Link
                  href={`/analyze?repo=${encodeURIComponent(repositoryUrl)}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-devops-blue transition hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-devops-blue/70"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  {isSpanish ? "Volver a analizar este repo" : "Analyze this repo again"}
                  <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

interface EvidencePanelProps {
  mission: GuidedLearningMission;
  language: ReportLanguage;
}

function EvidencePanel({ mission, language }: EvidencePanelProps) {
  const isSpanish = language === "es";

  return (
    <div className="border-t-2 border-devops-amber bg-slate-950/40 p-4">
      <div className="flex items-start gap-3">
        {mission.evidenceLevel === "confirmed" ? (
          <Search aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-devops-green" />
        ) : (
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-devops-amber" />
        )}
        <div>
          <h4 className="text-sm font-semibold text-white">
            {isSpanish ? "Que sabe realmente el analisis" : "What the analysis actually knows"}
          </h4>
          <p className="mt-2 text-sm leading-6 text-devops-muted">{mission.evidenceReason}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {mission.evidence.map((item) => (
          <div key={item.id} className="border-l border-devops-border pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={evidenceTone[item.level]}>{evidenceLabel(item.level, language)}</Badge>
              <span className="text-sm font-semibold text-devops-text">{item.label}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-devops-muted">{item.detail}</p>
            {item.files.length ? (
              <p className="mt-2 break-words font-mono text-[11px] leading-5 text-sky-200">
                {item.files.join(", ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

interface KnowledgeCheckProps {
  mission: GuidedLearningMission;
  language: ReportLanguage;
  selectedAnswerId?: string;
  onAnswer: (optionId: string) => void;
}

function KnowledgeCheck({ mission, language, selectedAnswerId, onAnswer }: KnowledgeCheckProps) {
  const isSpanish = language === "es";
  const selectedAnswer = mission.knowledgeCheck.options.find(
    (option) => option.id === selectedAnswerId
  );

  return (
    <section aria-labelledby={`${mission.id}-check`} className="border-y border-devops-border py-6">
      <div className="flex items-center gap-2 text-devops-violet">
        <HelpCircle aria-hidden="true" className="h-5 w-5" />
        <h4 id={`${mission.id}-check`} className="font-semibold text-white">
          {isSpanish ? "Comprueba que lo entendiste" : "Check your understanding"}
        </h4>
      </div>
      <p className="mt-3 text-lg leading-7 text-devops-text">{mission.knowledgeCheck.question}</p>
      <div className="mt-4 grid gap-2">
        {mission.knowledgeCheck.options.map((option) => {
          const isSelected = option.id === selectedAnswerId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onAnswer(option.id)}
              className={`flex min-h-12 items-center gap-3 border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
                isSelected && option.correct
                  ? "border-devops-green/60 bg-devops-green/8 text-white"
                  : isSelected
                    ? "border-devops-red/60 bg-devops-red/8 text-white"
                    : "border-devops-border bg-slate-950/40 text-devops-muted hover:border-devops-blue/55 hover:text-white"
              }`}
            >
              {isSelected && option.correct ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-devops-green" />
              ) : (
                <Circle aria-hidden="true" className="h-5 w-5 shrink-0" />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      {selectedAnswer ? (
        <div
          className={`mt-4 border-l-2 pl-4 text-sm leading-6 ${
            selectedAnswer.correct
              ? "border-devops-green text-emerald-100"
              : "border-devops-red text-red-100"
          }`}
          role="status"
        >
          <p className="font-semibold">{selectedAnswer.feedback}</p>
          <p className="mt-1 text-devops-muted">{mission.knowledgeCheck.explanation}</p>
        </div>
      ) : null}
    </section>
  );
}

function evidenceLabel(level: LearningEvidenceLevel, language: ReportLanguage): string {
  const labels: Record<LearningEvidenceLevel, { es: string; en: string }> = {
    confirmed: { es: "Confirmado", en: "Confirmed" },
    inferred: { es: "Inferido", en: "Inferred" },
    "needs-review": { es: "Revisar", en: "Review" }
  };

  return labels[level][language];
}
