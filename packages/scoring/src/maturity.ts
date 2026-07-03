import type { DevOpsMaturityLevel } from "@redevops-lab/shared";

export function getMaturityLevel(percentage: number): DevOpsMaturityLevel {
  if (percentage >= 85) {
    return "Advanced";
  }

  if (percentage >= 70) {
    return "Production-Ready";
  }

  if (percentage >= 50) {
    return "Operational";
  }

  if (percentage >= 25) {
    return "Foundation";
  }

  return "Initial";
}
