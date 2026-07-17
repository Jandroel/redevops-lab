import type {
  ReportLanguage,
  RepositoryContentAnalysis,
  RepositoryContentCheck
} from "@redevops-lab/shared";
import { AlertTriangle, CheckCircle2, FileSearch, HelpCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContentAnalysisPanelProps {
  analysis?: RepositoryContentAnalysis;
  language: ReportLanguage;
}

export function ContentAnalysisPanel({ analysis, language }: ContentAnalysisPanelProps) {
  if (!analysis) {
    return (
      <section className="rounded-lg border border-devops-border bg-devops-surface/70 p-6">
        <h2 className="text-xl font-semibold text-white">
          {language === "es" ? "Analisis profundo" : "Deep analysis"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-devops-muted">
          {language === "es"
            ? "Este reporte fue generado sin lectura acotada de contenido. Vuelve a analizar el repositorio para obtener evidencia mas precisa."
            : "This report was generated without bounded content inspection. Analyze the repository again for more precise evidence."}
        </p>
      </section>
    );
  }

  const passed = analysis.checks.filter((check) => check.status === "passed");
  const warnings = analysis.checks.filter((check) => check.status === "warning");
  const missing = analysis.checks.filter((check) => check.status === "missing");
  const attention = [...warnings, ...missing];

  return (
    <section className="min-w-0 rounded-lg border border-devops-border bg-devops-surface/70 p-6">
      <div className="flex flex-col gap-4 border-b border-devops-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-devops-blue" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">
              {language === "es" ? "Analisis profundo del repositorio" : "Deep repository analysis"}
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-devops-muted">
            {language === "es"
              ? "Confirma practicas leyendo contenido seguro y limitado. Nunca expone el contenido crudo ni valores de variables de entorno."
              : "Confirms practices by reading safe, bounded content. Raw file content and environment values are never exposed."}
          </p>
        </div>
        <Badge tone="blue">{analysis.stats.analyzedFiles} files inspected</Badge>
      </div>

      <div className="grid border-b border-devops-border sm:grid-cols-3 sm:divide-x sm:divide-devops-border">
        <SummaryStat
          label={language === "es" ? "Confirmadas" : "Confirmed"}
          value={passed.length}
          tone="green"
        />
        <SummaryStat
          label={language === "es" ? "Revisar" : "Review"}
          value={warnings.length}
          tone="amber"
        />
        <SummaryStat
          label={language === "es" ? "Ausentes" : "Missing"}
          value={missing.length}
          tone="muted"
        />
      </div>

      {analysis.files.length ? (
        <div className="border-b border-devops-border py-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-devops-muted">
            {language === "es" ? "Archivos inspeccionados" : "Inspected files"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.files.map((file) => (
              <span
                key={`${file.kind}:${file.path}`}
                className="max-w-full break-words rounded-md border border-devops-border bg-slate-950/65 px-2.5 py-1.5 font-mono text-xs text-devops-text"
              >
                {file.path}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {attention.length ? (
        <div className="pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-devops-amber">
            {language === "es" ? "Primero revisa esto" : "Review these first"}
          </p>
        </div>
      ) : null}
      <div className="divide-y divide-devops-border">
        {attention.map((check) => (
          <ContentCheckRow key={check.key} check={check} language={language} />
        ))}
      </div>

      {passed.length ? (
        <details className="group border-t border-devops-border pt-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-2 text-sm font-semibold text-devops-text focus:outline-none focus:ring-2 focus:ring-devops-blue/60">
            <span>
              {language === "es"
                ? `Ver ${passed.length} comprobaciones confirmadas`
                : `View ${passed.length} confirmed checks`}
            </span>
            <span className="font-mono text-devops-green transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-2 divide-y divide-devops-border">
            {passed.map((check) => (
              <ContentCheckRow key={check.key} check={check} language={language} />
            ))}
          </div>
        </details>
      ) : null}

      {analysis.warnings.length ? (
        <div className="mt-5 border-t border-devops-border pt-5">
          <div className="flex items-center gap-2 text-sm font-medium text-devops-amber">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {language === "es"
              ? "Limites o archivos no disponibles"
              : "Limits or unavailable files"}
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-devops-muted">
            {analysis.warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ContentCheckRow({
  check,
  language
}: {
  check: RepositoryContentCheck;
  language: ReportLanguage;
}) {
  const icon =
    check.status === "passed" ? (
      <CheckCircle2 className="h-5 w-5 text-devops-green" aria-hidden="true" />
    ) : check.status === "warning" ? (
      <AlertTriangle className="h-5 w-5 text-devops-amber" aria-hidden="true" />
    ) : check.status === "missing" ? (
      <HelpCircle className="h-5 w-5 text-devops-muted" aria-hidden="true" />
    ) : (
      <ShieldCheck className="h-5 w-5 text-devops-blue" aria-hidden="true" />
    );
  const tone = check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "slate";

  return (
    <article className="grid min-w-0 gap-3 py-5 md:grid-cols-[1fr_auto] md:gap-6">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">{check.title}</h3>
            <p className="mt-1 text-sm leading-6 text-devops-muted">{check.description}</p>
          </div>
        </div>
        {check.evidence.length ? (
          <div className="mt-3 flex flex-wrap gap-2 pl-8">
            {check.evidence.map((item) => (
              <span
                key={item}
                className="max-w-full break-words font-mono text-[11px] text-devops-blue"
              >
                {item}
              </span>
            ))}
          </div>
        ) : check.recommendation ? (
          <p className="mt-3 pl-8 text-xs leading-5 text-devops-muted">{check.recommendation}</p>
        ) : null}
      </div>
      <div className="pl-8 md:pl-0">
        <Badge tone={tone}>{statusLabel(check.status, language)}</Badge>
      </div>
    </article>
  );
}

function SummaryStat({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "muted";
}) {
  const color =
    tone === "green"
      ? "text-devops-green"
      : tone === "amber"
        ? "text-devops-amber"
        : "text-devops-muted";

  return (
    <div className="flex items-center justify-between gap-4 py-4 sm:block sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <span className="text-sm text-devops-muted">{label}</span>
      <strong className={`font-mono text-xl ${color} sm:mt-1 sm:block`}>{value}</strong>
    </div>
  );
}

function statusLabel(status: RepositoryContentCheck["status"], language: ReportLanguage): string {
  const labels = {
    passed: { es: "Confirmado", en: "Confirmed" },
    warning: { es: "Revisar", en: "Review" },
    missing: { es: "No detectado", en: "Not detected" },
    info: { es: "Informativo", en: "Informational" }
  } as const;

  return labels[status][language];
}
