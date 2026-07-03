interface TerminalCommandBlockProps {
  title: string;
  lines: readonly string[];
}

export function TerminalCommandBlock({ title, lines }: TerminalCommandBlockProps) {
  return (
    <section className="rounded-lg border border-devops-border bg-slate-950 panel-edge">
      <div className="flex items-center justify-between border-b border-devops-border px-5 py-4">
        <span className="font-mono text-xs text-devops-muted">{title}</span>
        <span className="h-2 w-2 rounded-full bg-devops-green" />
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-devops-text">
        {lines.map((line) => (
          <code key={line} className="block">
            {line}
          </code>
        ))}
      </pre>
    </section>
  );
}
