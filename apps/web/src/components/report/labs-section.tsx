"use client";

import type { DevOpsLab } from "@redevops-lab/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabCard } from "@/components/report/lab-card";
import { useState } from "react";

interface LabsSectionProps {
  labs: readonly DevOpsLab[];
  initialVisibleCount?: number;
}

export function LabsSection({ labs, initialVisibleCount = 4 }: LabsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleLabs = expanded ? labs : labs.slice(0, initialVisibleCount);
  const remainingLabs = Math.max(labs.length - visibleLabs.length, 0);

  return (
    <section className="rounded-lg border border-devops-border bg-slate-950/55 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Hands-on labs</h2>
          <p className="mt-2 text-sm leading-6 text-devops-muted">
            Practical exercises mapped to detected gaps, suggested files, and validation steps.
          </p>
        </div>
        <Badge tone="violet">{labs.length} labs</Badge>
      </div>
      {labs.length ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
          {labs.length > initialVisibleCount ? (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => setExpanded((value) => !value)}>
                {expanded ? "Show fewer labs" : `Show ${remainingLabs} more labs`}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-devops-muted">
          No hands-on labs are available for this report yet.
        </p>
      )}
    </section>
  );
}
