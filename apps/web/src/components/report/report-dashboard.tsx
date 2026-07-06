import type { DevOpsCategoryScore, DevOpsReport } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CategoryScoreBars } from "@/components/report/category-score-bars";
import { ChecklistSection } from "@/components/report/checklist-section";
import { ExportMarkdownButton } from "@/components/report/export-markdown-button";
import { ImportantFiles } from "@/components/report/important-files";
import { LabCard } from "@/components/report/lab-card";
import { LearningPathTimeline } from "@/components/report/learning-path-timeline";
import { ProductionChecklist } from "@/components/report/production-checklist";
import { RepoOverviewCard } from "@/components/report/repo-overview-card";
import { RepositorySignals } from "@/components/report/repository-signals";
import { ScoreCard } from "@/components/report/score-card";
import { ScoreInsights } from "@/components/report/score-insights";
import { ScoringEvidence } from "@/components/report/scoring-evidence";
import { TerminalCommandBlock } from "@/components/report/terminal-command-block";

interface ReportDashboardProps {
  report: DevOpsReport;
  sourceLabel?: string;
}

export function ReportDashboard({ report, sourceLabel = "API report" }: ReportDashboardProps) {
  const strengths = report.findings
    .filter((finding) => finding.type === "strength")
    .map((finding) => finding.title);
  const gaps = report.findings
    .filter((finding) => finding.type === "missing" || finding.type === "risk")
    .map((finding) => finding.title);
  const productionChecklist = report.productionChecklist ?? [];
  const terminalLines = [
    `report.id = ${report.id}`,
    `repository = ${report.repository.fullName}`,
    `default_branch = ${report.repository.defaultBranch ?? "unknown"}`,
    `score.total = ${report.score.total}`,
    `maturity = ${report.score.maturityLevel}`,
    `level = ${report.input.level}`,
    `language = ${report.input.language}`,
    `checklist.items = ${productionChecklist.length}`,
    `labs.generated = ${report.labs.length}`,
    `generated_at = ${report.generatedAt}`
  ];
  const signals = report.analysis?.devopsSignals ?? [];
  const importantFiles = report.analysis?.importantFiles ?? [];
  const treeStats = report.analysis?.treeStats;
  const categories = normalizeCategories(report.score.categories);
  const scoreStrengths = report.score.strengths ?? strengths;
  const scoreWeaknesses = report.score.weaknesses ?? gaps;
  const nextBestActions = report.score.nextBestActions ?? [];
  const scorePercentage =
    report.score.percentage ?? Math.round((report.score.total / report.score.maxScore) * 100);

  return (
    <section className="bg-devops-bg">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-devops-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="blue">{sourceLabel}</Badge>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
              DevOps readiness report
            </h1>
            <p className="mt-4 max-w-3xl leading-8 text-devops-muted">
              A structured report generated from repository metadata, file tree signals, and
              deterministic DevOps rules. The checklist, learning path, and labs are generated
              from the real analyzer evidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportMarkdownButton reportId={report.id} report={report} />
            <ButtonLink href="/analyze">Analyze another repo</ButtonLink>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <ScoreCard
            score={report.score.total}
            maxScore={report.score.maxScore}
            percentage={scorePercentage}
            maturity={report.score.maturityLevel}
          />
          <RepoOverviewCard
            repository={report.repository.fullName}
            url={report.repository.url}
            stack={report.detectedStack}
            metadata={{
              defaultBranch: report.repository.defaultBranch,
              stars: report.repository.stars,
              forks: report.repository.forks,
              pushedAt: report.repository.pushedAt,
              analyzedItems: treeStats?.analyzedItems
            }}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <CategoryScoreBars categories={categories} />
          <TerminalCommandBlock title="report.contract" lines={terminalLines} />
        </div>

        <div className="mt-6">
          <ScoreInsights
            strengths={scoreStrengths}
            weaknesses={scoreWeaknesses}
            nextBestActions={nextBestActions}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChecklistSection title="Detected strengths" items={strengths} tone="present" />
          <ChecklistSection title="Risks and missing practices" items={gaps} tone="missing" />
        </div>

        <div className="mt-6">
          <ScoringEvidence categories={categories} />
        </div>

        <div className="mt-6">
          <ProductionChecklist items={productionChecklist} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <RepositorySignals signals={signals} />
          <ImportantFiles files={importantFiles} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <LearningPathTimeline steps={report.learningPath} />
          <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Hands-on labs</h2>
              <Badge tone="violet">{report.labs.length} labs</Badge>
            </div>
            <div className="grid gap-4">
              {report.labs.map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function normalizeCategories(categories: DevOpsReport["score"]["categories"]): DevOpsCategoryScore[] {
  return categories.map((category) => ({
    ...category,
    percentage:
      category.percentage ??
      Math.round((category.score / (category.maxScore === 0 ? 1 : category.maxScore)) * 100),
    rules: category.rules ?? []
  }));
}
