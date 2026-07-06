import { cn } from "@/lib/utils";

export const analysisSteps = [
  "Validating repository URL",
  "Fetching repository metadata",
  "Reading repository tree",
  "Detecting DevOps signals",
  "Calculating maturity score",
  "Generating learning path",
  "Preparing AI mentor notes",
  "Building report"
] as const;

interface AnalysisProgressProps {
  activeStep: number;
  compact?: boolean;
}

export function AnalysisProgress({ activeStep, compact = false }: AnalysisProgressProps) {
  return (
    <div className={cn("rounded-lg border border-devops-border bg-slate-950/65", compact ? "p-4" : "p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-devops-blue">
          Analysis pipeline
        </p>
        <span className="font-mono text-xs text-devops-muted">
          step {Math.min(activeStep + 1, analysisSteps.length)}/{analysisSteps.length}
        </span>
      </div>
      <div className={cn("mt-4 grid gap-2", compact ? "sm:grid-cols-2" : "sm:grid-cols-4")}>
        {analysisSteps.map((step, index) => {
          const state = index < activeStep ? "done" : index === activeStep ? "active" : "pending";

          return (
            <div
              key={step}
              className={cn(
                "min-h-16 rounded-md border p-3 transition",
                state === "done" && "border-devops-green/35 bg-devops-green/10",
                state === "active" && "border-devops-blue/45 bg-devops-blue/10",
                state === "pending" && "border-devops-border bg-devops-bg/70"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
                    state === "done" && "border-devops-green/60 text-devops-green",
                    state === "active" &&
                      "animate-pulse border-devops-blue/70 text-devops-blue",
                    state === "pending" && "border-devops-border text-devops-muted"
                  )}
                >
                  {state === "done" ? "+" : index + 1}
                </span>
                <p
                  className={cn(
                    "text-xs leading-5",
                    state === "active" ? "text-devops-text" : "text-devops-muted"
                  )}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
