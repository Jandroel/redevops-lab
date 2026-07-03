import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  green: "border-devops-green/35 bg-devops-green/10 text-emerald-200",
  blue: "border-devops-blue/35 bg-devops-blue/10 text-sky-200",
  violet: "border-devops-violet/35 bg-devops-violet/10 text-violet-200",
  amber: "border-devops-amber/35 bg-devops-amber/10 text-amber-200",
  red: "border-devops-red/35 bg-devops-red/10 text-red-200",
  slate: "border-devops-border bg-slate-900/70 text-devops-muted"
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
}

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
