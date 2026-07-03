import { AnalyzeForm } from "@/components/analyze/analyze-form";
import { Badge } from "@/components/ui/badge";

export default function AnalyzePage() {
  return (
    <section className="min-h-[calc(100svh-8rem)] bg-devops-bg">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="green">Repository analyzer</Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">
            Generate a DevOps lab from a GitHub repository.
          </h1>
          <p className="mt-5 leading-8 text-devops-muted">
            Paste a public repository URL, choose the learning level and language, then generate
            a mock report that previews the analyzer workflow.
          </p>
        </div>
        <div className="mt-10">
          <AnalyzeForm />
        </div>
      </div>
    </section>
  );
}
