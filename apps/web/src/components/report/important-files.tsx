import { Badge } from "@/components/ui/badge";

interface ImportantFilesProps {
  files: readonly string[];
}

export function ImportantFiles({ files }: ImportantFilesProps) {
  return (
    <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Important files</h2>
        <Badge tone="slate">{files.length} files</Badge>
      </div>
      {files.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {files.slice(0, 24).map((file) => (
            <span
              key={file}
              className="rounded-md border border-devops-border bg-devops-surface/70 px-3 py-2 font-mono text-xs text-devops-muted"
            >
              {file}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-devops-muted">
          No important file list is available for this report.
        </p>
      )}
    </section>
  );
}
