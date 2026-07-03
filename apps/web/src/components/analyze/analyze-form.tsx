"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { analyzeRepository } from "@/lib/api";
import { saveReportToSession } from "@/lib/report-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isValidGitHubRepositoryUrl } from "@/lib/github";

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
] as const;

const languages = [
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" }
] as const;

const loadingSteps = [
  "Validating repository URL...",
  "Fetching repository metadata...",
  "Reading repository tree...",
  "Detecting DevOps signals...",
  "Building your DevOps lab..."
];

export function AnalyzeForm() {
  const router = useRouter();
  const [url, setUrl] = useState("https://github.com/Jandroel/redevops-lab");
  const [level, setLevel] = useState<(typeof levels)[number]["value"]>("beginner");
  const [language, setLanguage] = useState<(typeof languages)[number]["value"]>("es");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const isValid = useMemo(() => isValidGitHubRepositoryUrl(url), [url]);

  useEffect(() => {
    if (status !== "loading") {
      setActiveStep(0);
      return undefined;
    }

    const id = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % loadingSteps.length);
    }, 900);

    return () => window.clearInterval(id);
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      setStatus("error");
      setMessage("Enter a valid GitHub repository URL.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const report = await analyzeRepository({
        url,
        level,
        language
      });

      saveReportToSession(report);
      router.push(`/report/${report.id}`);
    } catch (error) {
      setStatus("error");
      setMessage(normalizeAnalyzeError(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-devops-border bg-devops-surface/80 p-6 panel-edge">
      <div>
        <label className="text-sm font-medium text-devops-text" htmlFor="repo-url">
          GitHub repository URL
        </label>
        <Input
          id="repo-url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setStatus("idle");
            setMessage("");
          }}
          placeholder="https://github.com/user/project"
          className="mt-3"
        />
        {status === "error" ? <p className="mt-2 text-sm text-devops-red">{message}</p> : null}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-medium text-devops-text">Experience level</legend>
          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-devops-border bg-slate-950/60">
            {levels.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setLevel(item.value)}
                className={cn(
                  "h-11 border-r border-devops-border px-2 text-sm transition last:border-r-0",
                  level === item.value
                    ? "bg-devops-green text-slate-950"
                    : "text-devops-muted hover:bg-slate-900 hover:text-devops-text"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-devops-text">Report language</legend>
          <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-devops-border bg-slate-950/60">
            {languages.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setLanguage(item.value)}
                className={cn(
                  "h-11 border-r border-devops-border px-3 text-sm transition last:border-r-0",
                  language === item.value
                    ? "bg-devops-blue text-slate-950"
                    : "text-devops-muted hover:bg-slate-900 hover:text-devops-text"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 rounded-lg border border-devops-border bg-slate-950/65 p-4">
        <div className="grid gap-3 font-mono text-sm text-devops-muted sm:grid-cols-3">
          <span>source: github</span>
          <span>level: {level}</span>
          <span>language: {language}</span>
        </div>
        {status === "loading" ? (
          <div className="mt-4 space-y-2">
            {loadingSteps.map((item, index) => (
              <div
                key={item}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  index === activeStep ? "text-devops-text" : "text-devops-muted"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    index === activeStep ? "animate-pulse bg-devops-green" : "bg-devops-border"
                  )}
                />
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-devops-muted">
          Phase 3 reads the public GitHub tree and stores the generated report temporarily in this browser.
        </p>
        <Button type="submit" size="lg" disabled={status === "loading"}>
          {status === "loading" ? "Generating..." : "Generate DevOps Lab"}
        </Button>
      </div>
    </form>
  );
}

function normalizeAnalyzeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "The API is not available right now.";
  const lower = message.toLowerCase();

  if (lower.includes("rate limit")) {
    return "GitHub rate limit reached. Add a GITHUB_TOKEN locally or try again later.";
  }

  if (lower.includes("not found") || lower.includes("not public")) {
    return "Repository not found or not public. Check the URL and try another public repo.";
  }

  if (lower.includes("empty")) {
    return "This repository appears to be empty, so there is no file tree to analyze.";
  }

  if (lower.includes("github repository url")) {
    return "Enter a valid GitHub repository URL like https://github.com/owner/repo.";
  }

  if (lower.includes("reach github") || lower.includes("failed to fetch")) {
    return "Could not reach GitHub from the API. Check network access and try again.";
  }

  return message;
}
