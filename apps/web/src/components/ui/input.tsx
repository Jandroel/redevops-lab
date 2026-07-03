import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md border border-devops-border bg-slate-950/75 px-4 font-mono text-sm text-devops-text outline-none transition placeholder:text-slate-500 focus:border-devops-blue/80 focus:ring-2 focus:ring-devops-blue/20",
        className
      )}
      {...props}
    />
  );
}
