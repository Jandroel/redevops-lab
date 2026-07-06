import { Badge } from "@/components/ui/badge";

interface ScoreCardProps {
  score: number;
  maxScore: number;
  percentage: number;
  maturity: string;
}

export function ScoreCard({ score, maxScore, percentage, maturity }: ScoreCardProps) {
  const degrees = Math.min(100, Math.max(0, percentage)) * 3.6;

  return (
    <section className="panel-edge rounded-lg border border-devops-border bg-devops-surface/80 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone="green">DevOps Score</Badge>
          <h1 className="mt-5 text-3xl font-semibold text-white">Repository diagnosis</h1>
          <p className="mt-2 text-devops-muted">Maturity level: {maturity}</p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-devops-muted">
            This score is calculated from detected repository signals, not guessed by AI.
          </p>
        </div>
        <div
          className="grid h-36 w-36 shrink-0 place-items-center rounded-full self-center sm:self-start"
          style={{
            background: `radial-gradient(circle at center, #0B1220 0 57%, transparent 58%), conic-gradient(#22C55E 0deg, #38BDF8 ${degrees}deg, rgba(30,41,59,0.95) ${degrees}deg 360deg)`
          }}
        >
          <div className="text-center">
            <p className="text-4xl font-semibold text-white">{score}</p>
            <p className="font-mono text-xs text-devops-muted">/ {maxScore}</p>
            <p className="mt-1 font-mono text-[10px] text-devops-muted">{percentage}%</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Rule-based", "Evidence-backed"],
          ["Max score", String(maxScore)],
          ["Maturity", maturity]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-devops-border bg-slate-950/55 p-3">
            <p className="text-xs text-devops-muted">{label}</p>
            <p className="mt-1 font-mono text-sm text-devops-text">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
