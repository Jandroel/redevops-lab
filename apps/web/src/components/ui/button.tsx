import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border-devops-green/70 bg-devops-green text-slate-950 shadow-[0_0_30px_rgba(34,197,94,0.28)] hover:bg-emerald-300",
  secondary:
    "border-devops-border bg-devops-surface/80 text-devops-text hover:border-devops-blue/60 hover:bg-slate-900",
  ghost: "border-transparent bg-transparent text-devops-muted hover:text-devops-text"
};

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus:outline-none focus:ring-2 focus:ring-devops-blue/70",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
