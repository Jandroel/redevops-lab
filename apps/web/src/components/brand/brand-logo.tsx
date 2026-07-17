import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  showName?: boolean;
}

export function BrandLogo({ className, markClassName, showName = true }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <Image
        src="/brand/redevops-mark.svg"
        alt=""
        width={40}
        height={40}
        priority
        className={cn("h-10 w-10 shrink-0", markClassName)}
      />
      {showName ? (
        <span className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap leading-none">
          <span className="text-base font-semibold text-white">
            Re<span className="text-devops-green">DevOps</span>
          </span>
          <span className="font-mono text-xs font-semibold text-devops-muted">Lab</span>
        </span>
      ) : null}
    </span>
  );
}
