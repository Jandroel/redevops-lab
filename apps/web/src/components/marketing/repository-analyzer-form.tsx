"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidGitHubRepositoryUrl } from "@/lib/github";

interface RepositoryAnalyzerFormProps {
  compact?: boolean;
}

export function RepositoryAnalyzerForm({ compact = false }: RepositoryAnalyzerFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("https://github.com/Jandroel/redevops-lab");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidGitHubRepositoryUrl(url)) {
      setError("Enter a valid public GitHub repository URL.");
      return;
    }

    setError("");
    setIsLoading(true);

    window.setTimeout(() => {
      router.push(`/analyze?repo=${encodeURIComponent(url)}`);
    }, 700);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "w-full" : "w-full rounded-lg border border-devops-border bg-slate-950/55 p-3"}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          aria-label="GitHub repository URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://github.com/user/project"
          className="h-12"
        />
        <Button type="submit" size="lg" disabled={isLoading} className="shrink-0">
          {isLoading ? "Opening analyzer..." : "Analyze repository"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-devops-red">{error}</p> : null}
    </form>
  );
}
