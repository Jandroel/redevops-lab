"use client";

import { BookOpenCheck, ChartNoAxesCombined } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { ExperienceLevel, ReportLanguage } from "@redevops-lab/shared";

interface ReportModeSwitcherProps {
  level: ExperienceLevel;
  language: ReportLanguage;
  guided: ReactNode;
  technical: ReactNode;
}

export function ReportModeSwitcher({
  level,
  language,
  guided,
  technical
}: ReportModeSwitcherProps) {
  const [mode, setMode] = useState<"guided" | "technical">(
    level === "beginner" ? "guided" : "technical"
  );
  const isSpanish = language === "es";

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 border-y border-devops-border bg-slate-950/35 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {isSpanish
              ? "Elige como quieres recorrer el resultado"
              : "Choose how to explore the result"}
          </p>
          <p className="mt-1 text-sm text-devops-muted">
            {isSpanish
              ? "El modo guiado ensena una mision a la vez. El informe tecnico conserva todo el detalle."
              : "Guided mode teaches one mission at a time. The technical report keeps every detail."}
          </p>
        </div>
        <div
          className="grid shrink-0 grid-cols-2 rounded-md border border-devops-border bg-devops-bg p-1"
          role="tablist"
          aria-label={isSpanish ? "Vista del reporte" : "Report view"}
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "guided"}
            onClick={() => setMode("guided")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
              mode === "guided"
                ? "bg-devops-green text-slate-950"
                : "text-devops-muted hover:text-white"
            }`}
          >
            <BookOpenCheck aria-hidden="true" className="h-4 w-4" />
            {isSpanish ? "Modo guiado" : "Guided mode"}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "technical"}
            onClick={() => setMode("technical")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 ${
              mode === "technical"
                ? "bg-devops-blue text-slate-950"
                : "text-devops-muted hover:text-white"
            }`}
          >
            <ChartNoAxesCombined aria-hidden="true" className="h-4 w-4" />
            {isSpanish ? "Informe tecnico" : "Technical report"}
          </button>
        </div>
      </div>

      <div role="tabpanel" className="mt-6">
        {mode === "guided" ? guided : technical}
      </div>
    </div>
  );
}
