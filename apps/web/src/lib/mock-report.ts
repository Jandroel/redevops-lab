import type { DevOpsReport } from "@redevops-lab/shared";

function createRule(
  id: DevOpsReport["score"]["categories"][number]["rules"][number]["id"],
  category: DevOpsReport["score"]["categories"][number]["key"],
  title: string,
  points: number,
  maxPoints: number,
  evidence: string[]
): DevOpsReport["score"]["categories"][number]["rules"][number] {
  return {
    id,
    category,
    title,
    description: title,
    points,
    maxPoints,
    passed: points > 0,
    evidence,
    recommendation: points > 0 ? undefined : `Add evidence for: ${title}.`,
    severity: points > 0 ? undefined : "medium"
  };
}

const generatedAt = "2026-07-03T00:00:00.000Z";

export const demoReport: DevOpsReport = {
  id: "demo-jandroel-redevops-lab",
  repository: {
    provider: "github",
    owner: "Jandroel",
    name: "redevops-lab",
    fullName: "Jandroel/redevops-lab",
    url: "https://github.com/Jandroel/redevops-lab",
    defaultBranch: "main"
  },
  input: {
    url: "https://github.com/Jandroel/redevops-lab",
    level: "beginner",
    language: "es"
  },
  score: {
    total: 43,
    maxScore: 100,
    percentage: 43,
    maturityLevel: "Foundation",
    categories: [
      {
        key: "containerization",
        name: "Containerization",
        score: 5,
        maxScore: 20,
        percentage: 25,
        summary: "Containerization needs attention based on Docker signals.",
        rules: [
          createRule("containerization.dockerfile", "containerization", "Dockerfile detected", 0, 8, []),
          createRule("containerization.compose", "containerization", "Docker Compose detected", 5, 5, ["docker-compose.yml"])
        ]
      },
      {
        key: "ci_cd",
        name: "CI/CD",
        score: 17,
        maxScore: 20,
        percentage: 85,
        summary: "CI/CD is strong based on workflow naming signals.",
        rules: [
          createRule("ci_cd.pipeline", "ci_cd", "CI/CD pipeline detected", 10, 10, [".github/workflows/ci.yml"]),
          createRule("ci_cd.deploy", "ci_cd", "Deploy or release workflow probable", 0, 3, [])
        ]
      },
      {
        key: "security",
        name: "Security",
        score: 0,
        maxScore: 15,
        percentage: 0,
        summary: "Security automation needs attention based on missing scanning signals.",
        rules: [
          createRule("security.dependabot", "security", "Dependabot detected", 0, 5, []),
          createRule("security.scanning", "security", "Security scanner detected", 0, 3, [])
        ]
      },
      {
        key: "observability",
        name: "Observability",
        score: 3,
        maxScore: 10,
        percentage: 30,
        summary: "Observability needs attention based on health-only signals.",
        rules: [
          createRule("observability.health", "observability", "Health check signal detected", 3, 3, [
            "apps/api/src/modules/health/health.controller.ts"
          ])
        ]
      }
    ],
    strengths: ["CI/CD pipeline detected (+10)", "Environment example detected (+6)", "README detected (+3)"],
    weaknesses: [
      "Containerization is below 50% (5/20).",
      "Security is below 50% (0/15).",
      "Infrastructure is below 50% (1/10)."
    ],
    nextBestActions: [
      "Prioriza: Dockerfile detectado. Se detecto una ruta visible para construir una imagen de contenedor.",
      "Prioriza: Security scanning detectado. Se detectaron senales de analisis de dependencias, codigo o secretos.",
      "Siguiente lab recomendado: Conteneriza la aplicacion."
    ]
  },
  detectedStack: [
    { name: "Next.js", category: "frontend", confidence: 0.92 },
    { name: "NestJS", category: "backend", confidence: 0.9 },
    { name: "TypeScript", category: "language", confidence: 0.98 },
    { name: "Docker", category: "devops", confidence: 0.74 }
  ],
  findings: [
    {
      type: "strength",
      title: "Monorepo structure",
      description: "The repository separates web, API, and reusable packages into clear workspaces.",
      severity: "low"
    },
    {
      type: "missing",
      title: "Production Docker setup",
      description: "The project has local service orchestration, but production images are not defined yet.",
      severity: "medium"
    },
    {
      type: "missing",
      title: "Security scanning",
      description: "Dependency and secret scanning should be added to CI before production use.",
      severity: "high"
    }
  ],
  productionChecklist: [
    {
      id: "configuration.env_example",
      title: "Existe .env.example",
      description: "Se detecto una plantilla para variables de entorno o configuracion runtime.",
      status: "done",
      category: "configuration",
      priority: "high",
      evidence: [".env.example"]
    },
    {
      id: "containerization.dockerfile",
      title: "Dockerfile detectado",
      description: "No se detecto una ruta visible para construir una imagen de contenedor.",
      status: "missing",
      category: "containerization",
      priority: "high",
      evidence: ["No se detecto una senal visible."]
    },
    {
      id: "ci_cd.pipeline",
      title: "Pipeline CI detectado",
      description: "Se detecto al menos una configuracion de CI/CD visible.",
      status: "done",
      category: "ci_cd",
      priority: "high",
      evidence: [".github/workflows/ci.yml"]
    },
    {
      id: "security.scanning",
      title: "Security scanning detectado",
      description: "No se detectaron senales de analisis de dependencias, codigo o secretos.",
      status: "missing",
      category: "security",
      priority: "high",
      evidence: ["No se detecto una senal visible."]
    },
    {
      id: "observability.logging_metrics",
      title: "Logging o metricas detectadas",
      description: "Health existe, pero no se detectaron senales claras de logs o metricas.",
      status: "recommended",
      category: "observability",
      priority: "medium",
      evidence: ["apps/api/src/modules/health/health.controller.ts"]
    }
  ],
  learningPath: [
    {
      id: "path-runtime-configuration",
      order: 1,
      title: "Documenta la configuracion runtime",
      description: "Aclara que variables y pasos necesita el proyecto para ejecutarse.",
      topics: ["Configuracion", "environment variables", "secret hygiene"],
      relatedFiles: [".env.example", "README.md"],
      labs: ["lab-env-example"],
      status: "completed",
      difficulty: "beginner"
    },
    {
      id: "path-containerize-application",
      order: 2,
      title: "Conteneriza la aplicacion",
      description: "Agrega una ruta reproducible para empaquetar la aplicacion como imagen.",
      topics: ["Contenedores", "Docker", "container image"],
      relatedFiles: ["Dockerfile", ".dockerignore"],
      labs: ["lab-dockerfile"],
      status: "recommended",
      difficulty: "beginner"
    },
    {
      id: "path-security-baseline",
      order: 3,
      title: "Agrega seguridad basica de supply chain",
      description: "Introduce senales visibles para actualizaciones, escaneo y politica de seguridad.",
      topics: ["Seguridad", "supply chain", "dependency scanning"],
      relatedFiles: [".github/dependabot.yml", ".github/workflows/security.yml"],
      labs: ["lab-security-scanning"],
      status: "recommended",
      difficulty: "intermediate"
    },
    {
      id: "path-operational-visibility",
      order: 4,
      title: "Agrega health checks y visibilidad operativa",
      description: "Haz que el estado del servicio sea visible para despliegues y monitoreo inicial.",
      topics: ["Observabilidad", "health checks", "logging"],
      relatedFiles: ["apps/api/src/modules/health/health.controller.ts", "docs/observability.md"],
      labs: ["lab-observability"],
      status: "recommended",
      difficulty: "intermediate"
    },
    {
      id: "path-deployment-documentation",
      order: 5,
      title: "Documenta el proceso de despliegue",
      description: "Explica como preparar, desplegar y verificar una version.",
      topics: ["Documentacion", "runbooks"],
      relatedFiles: ["docs/deployment.md", "README.md"],
      labs: ["lab-deployment-docs"],
      status: "recommended",
      difficulty: "beginner"
    }
  ],
  labs: [
    {
      id: "lab-env-example",
      title: "Crea un archivo de entorno de ejemplo",
      difficulty: "beginner",
      objective: "Documentar las variables necesarias para ejecutar el proyecto.",
      whyItMatters: "Reduce friccion para nuevos contribuidores y evita compartir secretos reales.",
      suggestedFiles: [".env.example", "README.md"],
      steps: [
        "Lista las variables que el proyecto espera en runtime.",
        "Crea .env.example con nombres y valores falsos.",
        "Verifica que ningun secreto real quede escrito."
      ],
      validation: "Un nuevo desarrollador puede configurar el proyecto usando README y .env.example.",
      estimatedTime: "20-30 min",
      category: "configuration"
    },
    {
      id: "lab-dockerfile",
      title: "Conteneriza la aplicacion con Docker",
      difficulty: "beginner",
      objective: "Crear una ruta reproducible para construir una imagen de la aplicacion.",
      whyItMatters: "Docker hace que desarrollo, CI y despliegue compartan una base mas consistente.",
      suggestedFiles: ["Dockerfile (suggested)", ".dockerignore (suggested)", "package.json"],
      steps: [
        "Identifica el comando de build o arranque del stack detectado.",
        "Crea un Dockerfile minimo para instalar dependencias y arrancar la app.",
        "Agrega .dockerignore para excluir dependencias, builds locales y secretos."
      ],
      validation: "La imagen se puede construir localmente y la documentacion explica como ejecutarla.",
      estimatedTime: "30-45 min",
      category: "containerization"
    },
    {
      id: "lab-security-scanning",
      title: "Agrega escaneo de dependencias y codigo",
      difficulty: "intermediate",
      objective: "Detectar riesgos de dependencias, codigo o secretos antes del despliegue.",
      whyItMatters: "El escaneo temprano reduce riesgo de supply chain y errores repetidos.",
      suggestedFiles: [".github/dependabot.yml (suggested)", ".github/workflows/security.yml (suggested)"],
      steps: [
        "Agrega Dependabot para el ecosistema principal del repositorio.",
        "Evalua CodeQL, Semgrep, Trivy o Gitleaks segun el stack.",
        "Documenta como revisar hallazgos de seguridad."
      ],
      validation: "Los resultados de seguridad quedan visibles en pull requests o en la pestana Security.",
      estimatedTime: "40-60 min",
      category: "security"
    },
    {
      id: "lab-observability",
      title: "Agrega health check y logging basico",
      difficulty: "intermediate",
      objective: "Exponer una senal minima para saber si la aplicacion responde correctamente.",
      whyItMatters: "Sin senales operativas, los fallos son mas dificiles de detectar y explicar.",
      suggestedFiles: ["apps/api/src/modules/health", "docs/observability.md (suggested)"],
      steps: [
        "Define una respuesta /health o equivalente para el stack.",
        "Agrega logging basico para arranque, errores y requests importantes.",
        "Documenta que endpoint o comando debe revisar un monitor."
      ],
      validation: "Existe una senal verificable de salud y la documentacion explica como usarla.",
      estimatedTime: "30-45 min",
      category: "observability"
    },
    {
      id: "lab-deployment-docs",
      title: "Documenta el proceso de despliegue",
      difficulty: "beginner",
      objective: "Hacer reproducible la preparacion, despliegue y verificacion de una version.",
      whyItMatters: "Una guia clara evita conocimiento tribal y errores de handoff.",
      suggestedFiles: ["docs/deployment.md", "README.md"],
      steps: [
        "Anota prerequisitos, variables y servicios externos.",
        "Describe build, deploy y verificacion post-deploy.",
        "Marca claramente los pasos pendientes o asumidos."
      ],
      validation: "Otra persona puede seguir la guia sin depender de explicaciones privadas.",
      estimatedTime: "25-40 min",
      category: "documentation"
    }
  ],
  analysis: {
    repository: {
      provider: "github",
      owner: "Jandroel",
      name: "redevops-lab",
      fullName: "Jandroel/redevops-lab",
      url: "https://github.com/Jandroel/redevops-lab",
      defaultBranch: "main",
      stars: 0,
      forks: 0,
      openIssues: 0,
      license: "MIT",
      isPrivate: false,
      pushedAt: generatedAt,
      createdAt: generatedAt,
      updatedAt: generatedAt
    },
    tree: [
      { path: ".env.example", type: "file", extension: ".example" },
      { path: ".github/workflows/ci.yml", type: "file", extension: ".yml" },
      { path: "README.md", type: "file", extension: ".md" },
      { path: "apps/api/src/modules/health/health.controller.ts", type: "file", extension: ".ts" },
      { path: "docker-compose.yml", type: "file", extension: ".yml" },
      { path: "docs/deployment.md", type: "file", extension: ".md" },
      { path: "LICENSE", type: "file" },
      { path: "package.json", type: "file", extension: ".json" }
    ],
    importantFiles: [
      ".env.example",
      ".github/workflows/ci.yml",
      "README.md",
      "apps/api/src/modules/health/health.controller.ts",
      "docker-compose.yml",
      "docs/deployment.md",
      "LICENSE",
      "package.json"
    ],
    devopsSignals: [
      {
        key: "dockerfile",
        label: "Dockerfile",
        category: "containerization",
        detected: false,
        confidence: 0,
        files: [],
        description: "No Dockerfile was found in the demo baseline."
      },
      {
        key: "docker_compose",
        label: "Docker Compose",
        category: "containerization",
        detected: true,
        confidence: 0.9,
        files: ["docker-compose.yml"],
        description: "A Docker Compose file is present for local development services."
      },
      {
        key: "github_actions",
        label: "GitHub Actions",
        category: "ci_cd",
        detected: true,
        confidence: 0.95,
        files: [".github/workflows/ci.yml"],
        description: "A GitHub Actions workflow is present in the scaffold."
      },
      {
        key: "env_example",
        label: "Environment example",
        category: "configuration",
        detected: true,
        confidence: 0.9,
        files: [".env.example"],
        description: "An environment example file documents planned runtime variables."
      },
      {
        key: "dependency_scanning",
        label: "Dependency scanning",
        category: "security",
        detected: false,
        confidence: 0,
        files: [],
        description: "No security scanning workflow is present yet."
      }
    ],
    detectedStack: [
      { name: "Next.js", category: "frontend", confidence: 0.92 },
      { name: "NestJS", category: "backend", confidence: 0.9 },
      { name: "TypeScript", category: "language", confidence: 0.98 },
      { name: "Docker", category: "devops", confidence: 0.74 }
    ],
    generatedAt,
    warnings: ["Fallback report is bundled in the web app for offline demo rendering."],
    treeStats: {
      totalItems: 8,
      analyzedItems: 8,
      truncated: false
    }
  },
  generatedAt
};
