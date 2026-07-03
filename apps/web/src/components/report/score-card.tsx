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
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone="green">DevOps Score</Badge>
          <h1 className="mt-5 text-3xl font-semibold text-white">Repository diagnosis</h1>
          <p className="mt-2 text-devops-muted">Maturity level: {maturity}</p>
        </div>
        <div
          className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
          style={{
            background: `radial-gradient(circle at center, #0B1220 0 57%, transparent 58%), conic-gradient(#22C55E 0deg, #38BDF8 ${degrees}deg, rgba(30,41,59,0.95) ${degrees}deg 360deg)`
          }}
        >
          <div className="text-center">
            <p className="text-3xl font-semibold text-white">{score}</p>
            <p className="font-mono text-xs text-devops-muted">/ {maxScore}</p>
            <p className="mt-1 font-mono text-[10px] text-devops-muted">{percentage}%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
