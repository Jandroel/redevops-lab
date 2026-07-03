interface ChecklistSectionProps {
  title: string;
  items: readonly string[];
  tone: "present" | "missing";
}

export function ChecklistSection({ title, items, tone }: ChecklistSectionProps) {
  const marker =
    tone === "present"
      ? "border-devops-green/40 bg-devops-green/10 text-devops-green"
      : "border-devops-amber/40 bg-devops-amber/10 text-devops-amber";

  return (
    <section className="rounded-lg border border-devops-border bg-devops-surface/70 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-devops-muted">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${marker}`}>
              {tone === "present" ? "+" : "!"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
