"use client";

import type { AiMentorMode, ExperienceLevel, ReportLanguage } from "@redevops-lab/shared";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnalysisProgress, analysisSteps } from "@/components/analyze/analysis-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeRepository, ApiClientError } from "@/lib/api";
import { isValidGitHubRepositoryUrl } from "@/lib/github";
import { saveReportToSession } from "@/lib/report-storage";
import { cn } from "@/lib/utils";

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
] as const satisfies readonly { value: ExperienceLevel; label: string }[];

const languages = [
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" }
] as const satisfies readonly { value: ReportLanguage; label: string }[];

const mentorModes = [
  { value: "learning", label: "Learning", description: "Roadmap and concepts" },
  { value: "interview", label: "Interview", description: "Talking points" },
  { value: "production", label: "Production", description: "Operational risk" },
  { value: "portfolio", label: "Portfolio", description: "Showcase value" },
  { value: "open-source", label: "Open source", description: "Contributor ready" }
] as const satisfies readonly {
  value: AiMentorMode;
  label: string;
  description: string;
}[];

const exampleRepos = [
  "https://github.com/docker/awesome-compose",
  "https://github.com/vercel/next.js",
  "https://github.com/nestjs/nest"
] as const;

interface AnalyzeFormProps {
  initialUrl?: string;
}

interface AnalyzeErrorDetails {
  title: string;
  description: string;
  action: string;
}

export function AnalyzeForm({ initialUrl }: AnalyzeFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl ?? "https://github.com/Jandroel/redevops-lab");
  const [level, setLevel] = useState<ExperienceLevel>("beginner");
  const [language, setLanguage] = useState<ReportLanguage>("es");
  const [mentorMode, setMentorMode] = useState<AiMentorMode>("learning");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorDetails, setErrorDetails] = useState<AnalyzeErrorDetails | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const isValid = useMemo(() => isValidGitHubRepositoryUrl(url), [url]);
  const hasUserInput = url.trim().length > 0;

  useEffect(() => {
    if (status !== "loading") {
      setActiveStep(0);
      return undefined;
    }

    const id = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, analysisSteps.length - 1));
    }, 850);

    return () => window.clearInterval(id);
  }, [status]);

  function updateUrl(nextUrl: string) {
    setUrl(nextUrl);
    setStatus("idle");
    setErrorDetails(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      setStatus("error");
      setErrorDetails({
        title: "Invalid repository URL",
        description: "Use a public GitHub repository URL such as https://github.com/owner/repo.",
        action: "Check the owner and repository name, then try again."
      });
      return;
    }

    setStatus("loading");
    setErrorDetails(null);

    try {
      const report = await analyzeRepository({
        url,
        level,
        language,
        mentorMode
      });

      saveReportToSession(report);
      router.push(`/report/${report.id}`);
    } catch (error) {
      setStatus("error");
      setErrorDetails(normalizeAnalyzeError(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-devops-border bg-devops-surface/80 p-5 panel-edge sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <label className="text-sm font-medium text-devops-text" htmlFor="repo-url">
            GitHub repository URL
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Input
              id="repo-url"
              value={url}
              onChange={(event) => updateUrl(event.target.value)}
              placeholder="https://github.com/user/project"
              className="h-12"
            />
            <Button type="submit" size="lg" disabled={status === "loading"} className="shrink-0">
              {status === "loading" ? "Analyzing..." : "Generate report"}
            </Button>
          </div>
          <div
            className={cn(
              "mt-3 rounded-md border px-3 py-2 text-sm",
              isValid
                ? "border-devops-green/35 bg-devops-green/10 text-emerald-200"
                : hasUserInput
                  ? "border-devops-amber/35 bg-devops-amber/10 text-amber-200"
                  : "border-devops-border bg-slate-950/55 text-devops-muted"
            )}
          >
            {isValid
              ? "Public GitHub URL format looks valid."
              : "Paste a public GitHub repository URL to start the analyzer."}
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-devops-text">Try an example repository</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {exampleRepos.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => updateUrl(example)}
                  className="rounded-md border border-devops-border bg-slate-950/55 px-3 py-2 font-mono text-xs text-devops-muted transition hover:border-devops-blue/60 hover:text-devops-text focus:outline-none focus:ring-2 focus:ring-devops-blue/50"
                >
                  {example.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-devops-border bg-slate-950/55 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-devops-green">
            Public repo only
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-devops-muted">
            <li>ReDevOps Lab reads public repository metadata and file-tree signals.</li>
            <li>It does not modify repositories, open issues, or store frontend API keys.</li>
            <li>AI mentor notes are optional and never replace deterministic score facts.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_0.65fr_1fr]">
        <SegmentedField
          label="Experience level"
          value={level}
          items={levels}
          tone="green"
          onChange={setLevel}
        />
        <SegmentedField
          label="Report language"
          value={language}
          items={languages}
          tone="blue"
          onChange={setLanguage}
        />
        <fieldset>
          <legend className="text-sm font-medium text-devops-text">Mentor mode</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {mentorModes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMentorMode(item.value)}
                className={cn(
                  "min-h-16 rounded-md border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-devops-blue/50",
                  mentorMode === item.value
                    ? "border-devops-violet/60 bg-devops-violet/15 text-devops-text"
                    : "border-devops-border bg-slate-950/55 text-devops-muted hover:border-devops-violet/45 hover:text-devops-text"
                )}
              >
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-devops-muted">
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 rounded-lg border border-devops-border bg-slate-950/65 p-4">
        <div className="grid gap-3 font-mono text-sm text-devops-muted sm:grid-cols-4">
          <span>source: github</span>
          <span>level: {level}</span>
          <span>language: {language}</span>
          <span>mentor: {mentorMode}</span>
        </div>
      </div>

      {status === "loading" ? (
        <div className="mt-6">
          <AnalysisProgress activeStep={activeStep} />
        </div>
      ) : null}

      {status === "error" && errorDetails ? (
        <AnalyzeErrorPanel details={errorDetails} onRetry={() => setStatus("idle")} />
      ) : null}
    </form>
  );
}

interface SegmentedFieldProps<T extends string> {
  label: string;
  value: T;
  items: readonly { value: T; label: string }[];
  tone: "green" | "blue";
  onChange: (value: T) => void;
}

function SegmentedField<T extends string>({
  label,
  value,
  items,
  tone,
  onChange
}: SegmentedFieldProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-devops-text">{label}</legend>
      <div className="mt-3 grid overflow-hidden rounded-md border border-devops-border bg-slate-950/60" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "min-h-11 border-r border-devops-border px-2 text-sm transition last:border-r-0 focus:outline-none focus:ring-2 focus:ring-devops-blue/50",
              value === item.value
                ? tone === "green"
                  ? "bg-devops-green text-slate-950"
                  : "bg-devops-blue text-slate-950"
                : "text-devops-muted hover:bg-slate-900 hover:text-devops-text"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function AnalyzeErrorPanel({
  details,
  onRetry
}: {
  details: AnalyzeErrorDetails;
  onRetry: () => void;
}) {
  return (
    <div className="mt-6 rounded-lg border border-devops-red/35 bg-devops-red/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{details.title}</h2>
          <p className="mt-2 text-sm leading-6 text-red-100">{details.description}</p>
          <p className="mt-2 text-sm leading-6 text-devops-muted">{details.action}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
          <Link
            href="/report/demo"
            className="inline-flex h-11 items-center justify-center rounded-md border border-devops-border bg-slate-950/55 px-4 text-sm font-semibold text-devops-text transition hover:border-devops-blue/60 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-devops-blue/60"
          >
            View demo report
          </Link>
        </div>
      </div>
    </div>
  );
}

function normalizeAnalyzeError(error: unknown): AnalyzeErrorDetails {
  const message = error instanceof Error ? error.message : "The API is not available right now.";
  const lower = message.toLowerCase();
  const statusCode = error instanceof ApiClientError ? error.statusCode : undefined;

  if (lower.includes("rate limit") || statusCode === 429) {
    return {
      title: "GitHub rate limit reached",
      description: "GitHub refused the request because the anonymous API quota is exhausted.",
      action: "Set GITHUB_TOKEN in the API environment or try again later."
    };
  }

  if (lower.includes("not found") || lower.includes("not public") || statusCode === 404) {
    return {
      title: "Repository not found",
      description: "The repository could not be read as a public GitHub repository.",
      action: "Check that the owner and repo name are correct and that the repository is public."
    };
  }

  if (lower.includes("private") || statusCode === 403) {
    return {
      title: "Repository is private or inaccessible",
      description: "This phase only supports public repositories that the GitHub API can read.",
      action: "Use a public repository or configure backend GitHub credentials for higher limits."
    };
  }

  if (lower.includes("timeout") || statusCode === 408 || statusCode === 504) {
    return {
      title: "Analysis timed out",
      description: "The repository took too long to analyze from the current API environment.",
      action: "Try again, or test with a smaller public repository first."
    };
  }

  if (statusCode === 502 || lower.includes("reach github")) {
    return {
      title: "GitHub could not be reached",
      description: "The API is running, but it could not complete the request to GitHub.",
      action: "Check network access from the backend terminal, try another public repo, or use the demo report."
    };
  }

  if (lower.includes("github repository url")) {
    return {
      title: "Invalid repository URL",
      description: "The analyzer only accepts URLs in the https://github.com/owner/repo format.",
      action: "Paste a complete public repository URL and submit again."
    };
  }

  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return {
      title: "API or network unavailable",
      description: "The frontend could not complete the request through the API.",
      action: "Confirm the API is running at NEXT_PUBLIC_API_URL and try again."
    };
  }

  return {
    title: "Unexpected analysis error",
    description: message,
    action: "Try again, then open the demo report if the API is still unavailable."
  };
}
