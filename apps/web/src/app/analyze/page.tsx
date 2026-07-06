import { AnalyzeForm } from "@/components/analyze/analyze-form";
import { Badge } from "@/components/ui/badge";

interface AnalyzePageProps {
  searchParams?: Promise<{
    repo?: string;
  }>;
}

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = await searchParams;
  const initialUrl = typeof params?.repo === "string" ? params.repo : undefined;

  return (
    <section className="min-h-[calc(100svh-8rem)] bg-devops-bg">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="green">Repository analyzer</Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">
            Analyze a public repository and turn gaps into a DevOps plan.
          </h1>
          <p className="mt-5 leading-8 text-devops-muted">
            Paste a GitHub URL, choose the learning level, language, and mentor mode, then generate
            a report with evidence-backed score, checklist, learning path, labs, and optional AI
            mentor notes.
          </p>
        </div>
        <div className="mt-10">
          <AnalyzeForm initialUrl={initialUrl} />
        </div>
      </div>
    </section>
  );
}
