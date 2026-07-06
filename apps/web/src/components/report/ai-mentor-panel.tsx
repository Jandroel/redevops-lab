import type { AiReportEnhancement } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";

interface AiMentorPanelProps {
  ai?: AiReportEnhancement;
}

export function AiMentorPanel({ ai }: AiMentorPanelProps) {
  const enabled = ai?.enabled ?? false;
  const provider = ai?.provider ?? "mock";
  const deterministicMode = !enabled || provider === "mock";

  return (
    <section className="rounded-lg border border-devops-border bg-devops-surface/70 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-devops-violet">
            DevOps AI Mentor
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            A mentor explaining your DevOps roadmap.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-devops-muted">
            {deterministicMode
              ? "AI Mentor is running in deterministic/mock mode. The guidance is safe for local demos and grounded in the report facts."
              : "Mentor guidance is generated from compact report evidence. It explains and prioritizes, but does not change the score or analyzer facts."}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={enabled ? "green" : "slate"}>{enabled ? "enabled" : "mock mode"}</Badge>
          <Badge tone="blue">{provider}</Badge>
          <Badge tone="violet">{ai?.mode ?? "learning"}</Badge>
        </div>
      </div>

      {ai ? (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <MentorCard title="Mentor summary" body={ai.mentorSummary} emphasis />
            <MentorCard title="Recommended focus" body={ai.recommendedFocus} />
            <MentorCard title="Score interpretation" body={ai.scoreInterpretation} />
            <MentorCard title="Risk explanation" body={ai.riskExplanation} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <MentorList title="Next mentor steps" items={ai.improvedNextSteps} tone="blue" />
            <MentorList title="Portfolio advice" items={ai.portfolioAdvice} tone="green" />
            <MentorList
              title="Interview talking points"
              items={ai.interviewTalkingPoints}
              tone="violet"
            />
            <MentorList title="Learning advice" items={ai.learningAdvice} tone="blue" />
            <MentorList title="Mentor notes" items={ai.mentorNotes} tone="green" />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-devops-border bg-slate-950/55 p-5">
          <p className="text-sm leading-6 text-devops-muted">
            The analyzer, scoring engine, checklist, learning path, and labs are available without
            AI. Enable the backend mentor layer when you want narrative guidance.
          </p>
        </div>
      )}
    </section>
  );
}

interface MentorCardProps {
  title: string;
  body: string;
  emphasis?: boolean;
}

function MentorCard({ title, body, emphasis = false }: MentorCardProps) {
  return (
    <article
      className={`rounded-lg border border-devops-border p-5 ${
        emphasis ? "bg-devops-violet/10" : "bg-slate-950/55"
      }`}
    >
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-devops-muted">{body}</p>
    </article>
  );
}

interface MentorListProps {
  title: string;
  items: readonly string[];
  tone: "green" | "blue" | "violet";
}

function MentorList({ title, items, tone }: MentorListProps) {
  const dotClass =
    tone === "green" ? "bg-devops-green" : tone === "blue" ? "bg-devops-blue" : "bg-devops-violet";

  return (
    <article className="rounded-lg border border-devops-border bg-slate-950/55 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      {items.length ? (
        <ul className="space-y-2 text-sm leading-6 text-devops-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-devops-muted">No mentor items available for this section.</p>
      )}
    </article>
  );
}
