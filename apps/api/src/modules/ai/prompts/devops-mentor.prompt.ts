import type { DevOpsReport } from "@redevops-lab/shared";
import type { AiEnhancementInput } from "../providers/ai-provider.interface.js";

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export function createDevOpsMentorMessages(input: AiEnhancementInput): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are the AI mentor layer of ReDevOps Lab.",
        "Use only the repository facts provided in the JSON input.",
        "You may explain, teach, prioritize and summarize.",
        "Do not invent files, tools, technologies, workflows, deployment targets, vulnerabilities or results.",
        "Do not change the deterministic score.",
        "Do not claim that something exists unless it appears in the provided evidence.",
        "If evidence is missing, say that no signal was detected.",
        "Return valid JSON only."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        outputSchema: {
          mentorSummary: "string",
          scoreInterpretation: "string",
          recommendedFocus: "string",
          riskExplanation: "string",
          mentorNotes: ["string"],
          portfolioAdvice: ["string"],
          interviewTalkingPoints: ["string"],
          improvedNextSteps: ["string"],
          learningAdvice: ["string"]
        },
        mentorMode: input.mode,
        language: input.report.input.language,
        level: input.report.input.level,
        repositoryFacts: createCompactReportContext(input.report)
      })
    }
  ];
}

export function createCompactReportContext(report: DevOpsReport) {
  return {
    repository: {
      fullName: report.repository.fullName,
      url: report.repository.url,
      defaultBranch: report.repository.defaultBranch,
      license: report.repository.license,
      stars: report.repository.stars,
      forks: report.repository.forks
    },
    score: {
      total: report.score.total,
      maxScore: report.score.maxScore,
      percentage: report.score.percentage,
      maturityLevel: report.score.maturityLevel,
      strengths: report.score.strengths.slice(0, 6),
      weaknesses: report.score.weaknesses.slice(0, 8),
      nextBestActions: report.score.nextBestActions.slice(0, 6),
      categories: report.score.categories.map((category) => ({
        key: category.key,
        name: category.name,
        score: category.score,
        maxScore: category.maxScore,
        percentage: category.percentage,
        missingRules: category.rules
          .filter((rule) => !rule.passed)
          .slice(0, 4)
          .map((rule) => ({
            id: rule.id,
            title: rule.title,
            recommendation: rule.recommendation,
            severity: rule.severity
          })),
        passedRules: category.rules
          .filter((rule) => rule.passed)
          .slice(0, 4)
          .map((rule) => ({
            id: rule.id,
            title: rule.title,
            evidence: rule.evidence.slice(0, 4)
          }))
      }))
    },
    findings: report.findings.slice(0, 10).map((finding) => ({
      type: finding.type,
      severity: finding.severity,
      title: finding.title,
      description: finding.description
    })),
    checklist: report.productionChecklist.slice(0, 18).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      category: item.category,
      priority: item.priority,
      evidence: item.evidence.slice(0, 4)
    })),
    learningPath: report.learningPath.slice(0, 8).map((step) => ({
      id: step.id,
      order: step.order,
      title: step.title,
      status: step.status,
      difficulty: step.difficulty,
      topics: step.topics.slice(0, 5),
      labs: step.labs
    })),
    labs: report.labs.slice(0, 8).map((lab) => ({
      id: lab.id,
      title: lab.title,
      difficulty: lab.difficulty,
      category: lab.category,
      objective: lab.objective,
      validation: lab.validation,
      suggestedFiles: lab.suggestedFiles.slice(0, 6)
    })),
    detectedStack: report.detectedStack.slice(0, 12),
    importantFiles: report.analysis?.importantFiles.slice(0, 20) ?? [],
    detectedSignals:
      report.analysis?.devopsSignals
        .filter((signal) => signal.detected)
        .slice(0, 15)
        .map((signal) => ({
          key: signal.key,
          label: signal.label,
          category: signal.category,
          files: signal.files.slice(0, 6)
        })) ?? []
  };
}
