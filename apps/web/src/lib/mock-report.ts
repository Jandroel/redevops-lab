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
          createRule(
            "containerization.dockerfile",
            "containerization",
            "Dockerfile detected",
            0,
            8,
            []
          ),
          createRule(
            "containerization.compose",
            "containerization",
            "Docker Compose detected",
            5,
            5,
            ["docker-compose.yml"]
          )
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
          createRule("ci_cd.pipeline", "ci_cd", "CI/CD pipeline detected", 10, 10, [
            ".github/workflows/ci.yml"
          ]),
          createRule("ci_cd.deploy", "ci_cd", "Deploy or release workflow probable", 0, 3, [])
        ]
      },
      {
        key: "configuration",
        name: "Configuration",
        score: 9,
        maxScore: 15,
        percentage: 60,
        summary: "Configuration readiness is developing based on environment examples and docs.",
        rules: [
          createRule(
            "configuration.env_example",
            "configuration",
            "Environment example detected",
            6,
            6,
            [".env.example"]
          ),
          createRule(
            "configuration.docs",
            "configuration",
            "Configuration documentation inferred",
            3,
            3,
            ["README.md"]
          ),
          createRule(
            "configuration.config_directory",
            "configuration",
            "Configuration directory detected",
            0,
            3,
            []
          ),
          createRule(
            "configuration.environments",
            "configuration",
            "Environment separation inferred",
            0,
            3,
            []
          )
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
          createRule(
            "observability.health",
            "observability",
            "Health check signal detected",
            3,
            3,
            ["apps/api/src/modules/health/health.controller.ts"]
          )
        ]
      },
      {
        key: "documentation",
        name: "Documentation",
        score: 8,
        maxScore: 10,
        percentage: 80,
        summary: "Documentation is strong based on README, docs, deployment, and license files.",
        rules: [
          createRule("documentation.readme", "documentation", "README detected", 3, 3, [
            "README.md"
          ]),
          createRule("documentation.docs", "documentation", "Docs directory detected", 2, 2, [
            "docs/deployment.md"
          ]),
          createRule(
            "documentation.deployment",
            "documentation",
            "Deployment documentation detected",
            2,
            2,
            ["docs/deployment.md"]
          ),
          createRule(
            "documentation.contributing",
            "documentation",
            "Contributing guide detected",
            0,
            1,
            []
          ),
          createRule("documentation.changelog", "documentation", "Changelog detected", 0, 1, []),
          createRule("documentation.license", "documentation", "License detected", 1, 1, ["MIT"])
        ]
      },
      {
        key: "infrastructure",
        name: "Infrastructure",
        score: 1,
        maxScore: 10,
        percentage: 10,
        summary:
          "Infrastructure readiness needs attention based on missing IaC and orchestration signals.",
        rules: [
          createRule(
            "infrastructure.iac",
            "infrastructure",
            "Infrastructure as Code detected",
            0,
            4,
            []
          ),
          createRule(
            "infrastructure.kubernetes",
            "infrastructure",
            "Kubernetes manifests detected",
            0,
            3,
            []
          ),
          createRule("infrastructure.helm", "infrastructure", "Helm chart detected", 0, 2, []),
          createRule(
            "infrastructure.deployment_config",
            "infrastructure",
            "Deployment or infra config detected",
            1,
            1,
            ["docs/deployment.md"]
          )
        ]
      }
    ],
    strengths: [
      "CI/CD pipeline detected (+10)",
      "Environment example detected (+6)",
      "README detected (+3)"
    ],
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
      description:
        "The repository separates web, API, and reusable packages into clear workspaces.",
      severity: "low"
    },
    {
      type: "missing",
      title: "Production Docker setup",
      description:
        "The project has local service orchestration, but production images are not defined yet.",
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
  concepts: [
    {
      id: "devops-feedback-loop",
      term: "Ciclo DevOps",
      category: "general",
      shortDefinition: "Conecta codigo, validacion, despliegue, observacion y aprendizaje.",
      beginnerExplanation:
        "DevOps no es una herramienta unica. Es un ciclo para cambiar en pequeno, validar, observar y mejorar.",
      whyItMatters: "Ayuda a convertir cambios manuales en practicas repetibles.",
      example: "PR -> CI -> deploy -> health check -> mejora siguiente",
      relatedTerms: ["ci-pipeline", "health-check"]
    },
    {
      id: "dockerfile",
      term: "Dockerfile",
      category: "containerization",
      shortDefinition: "Receta para construir una imagen de contenedor.",
      beginnerExplanation:
        "Describe que sistema base usar, que dependencias instalar y que comando ejecuta la app.",
      whyItMatters: "Reduce el clasico problema de que algo solo funciona en una maquina.",
      example: "docker build -t redevops-lab .",
      relatedTerms: ["container-image", "docker-compose"]
    },
    {
      id: "ci-pipeline",
      term: "CI pipeline",
      category: "ci_cd",
      shortDefinition: "Automatizacion que valida cambios antes de integrarlos.",
      beginnerExplanation:
        "Un pipeline puede instalar dependencias, correr tests, typecheck y build en cada pull request.",
      whyItMatters: "Atrapa errores temprano y crea reglas compartidas para aceptar cambios.",
      example: ".github/workflows/ci.yml ejecuta pnpm test",
      relatedTerms: ["quality-gate"]
    },
    {
      id: "health-check",
      term: "Health check",
      category: "observability",
      shortDefinition: "Endpoint o comando que indica si un servicio esta vivo.",
      beginnerExplanation: "Es la senal minima para saber si la app arranco y puede responder.",
      whyItMatters: "Permite verificar despliegues y monitoreo inicial.",
      example: "GET /api/health",
      relatedTerms: ["structured-logging", "metrics"]
    }
  ],
  learningModules: [
    {
      id: "module-devops-map",
      title: "Mapa mental DevOps",
      category: "general",
      summary: "Aprende a leer el reporte como evidencia, practica y mejora.",
      beginnerGoal: "Distinguir score, checklist, ruta, labs y evidencia.",
      whyNow: "Empieza aqui para convertir hallazgos en acciones pequenas.",
      concepts: ["devops-feedback-loop"],
      labs: [],
      checklistItems: [],
      estimatedTime: "15-25 min",
      outcome: "Puedes explicar que detecto ReDevOps Lab y que haras despues."
    },
    {
      id: "module-containers",
      title: "Contenedores reproducibles",
      category: "containerization",
      summary: "Pasa de instrucciones manuales a una forma repetible de construir.",
      beginnerGoal: "Entender la diferencia entre Dockerfile, imagen y Compose.",
      whyNow: "Containerization tiene practicas por reforzar en este repositorio.",
      concepts: ["dockerfile"],
      labs: ["lab-dockerfile"],
      checklistItems: ["containerization.dockerfile"],
      estimatedTime: "45-75 min",
      outcome: "Puedes construir o describir la imagen minima del proyecto."
    },
    {
      id: "module-observability",
      title: "Visibilidad operativa",
      category: "observability",
      summary: "Aprende que senales muestran si la app esta viva o fallando.",
      beginnerGoal: "Separar health checks, logs y metricas.",
      whyNow: "Observability tiene una base de health, pero falta reforzar logging o metricas.",
      concepts: ["health-check"],
      labs: ["lab-observability"],
      checklistItems: ["observability.logging_metrics"],
      estimatedTime: "35-70 min",
      outcome: "Puedes definir que observar primero despues de un despliegue."
    }
  ],
  guidedMissions: createFallbackGuidedMissions(),
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
      description:
        "Introduce senales visibles para actualizaciones, escaneo y politica de seguridad.",
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
      description:
        "Haz que el estado del servicio sea visible para despliegues y monitoreo inicial.",
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
      validation:
        "Un nuevo desarrollador puede configurar el proyecto usando README y .env.example.",
      estimatedTime: "20-30 min",
      category: "configuration"
    },
    {
      id: "lab-dockerfile",
      title: "Conteneriza la aplicacion con Docker",
      difficulty: "beginner",
      objective: "Crear una ruta reproducible para construir una imagen de la aplicacion.",
      whyItMatters:
        "Docker hace que desarrollo, CI y despliegue compartan una base mas consistente.",
      suggestedFiles: ["Dockerfile (suggested)", ".dockerignore (suggested)", "package.json"],
      steps: [
        "Identifica el comando de build o arranque del stack detectado.",
        "Crea un Dockerfile minimo para instalar dependencias y arrancar la app.",
        "Agrega .dockerignore para excluir dependencias, builds locales y secretos."
      ],
      validation:
        "La imagen se puede construir localmente y la documentacion explica como ejecutarla.",
      estimatedTime: "30-45 min",
      category: "containerization"
    },
    {
      id: "lab-security-scanning",
      title: "Agrega escaneo de dependencias y codigo",
      difficulty: "intermediate",
      objective: "Detectar riesgos de dependencias, codigo o secretos antes del despliegue.",
      whyItMatters: "El escaneo temprano reduce riesgo de supply chain y errores repetidos.",
      suggestedFiles: [
        ".github/dependabot.yml (suggested)",
        ".github/workflows/security.yml (suggested)"
      ],
      steps: [
        "Agrega Dependabot para el ecosistema principal del repositorio.",
        "Evalua CodeQL, Semgrep, Trivy o Gitleaks segun el stack.",
        "Documenta como revisar hallazgos de seguridad."
      ],
      validation:
        "Los resultados de seguridad quedan visibles en pull requests o en la pestana Security.",
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
  ai: {
    enabled: false,
    provider: "mock",
    mode: "learning",
    generatedAt,
    mentorSummary:
      "AI mentor is disabled. This fallback report was generated using deterministic repository analysis.",
    scoreInterpretation:
      "The score should be read as educational guidance based on visible repository signals, not as a formal audit.",
    recommendedFocus: "Focus first on Dockerfile, security scanning, and operational visibility.",
    riskExplanation:
      "The most visible risks are missing production containerization, security scanning, and deeper observability signals.",
    mentorNotes: [
      "Repository facts come from analyzer, scoring, and learning engines.",
      "Missing evidence means no signal was detected, not absolute proof that the practice does not exist."
    ],
    portfolioAdvice: [
      "Turn one lab into a small pull request with before/after notes.",
      "Show the checklist as evidence of practical DevOps learning."
    ],
    interviewTalkingPoints: [
      "Explain how deterministic repository signals become score categories.",
      "Describe why CI, Docker, security scanning, and observability are prioritized."
    ],
    improvedNextSteps: [
      "Add a Dockerfile or document the image build strategy.",
      "Add dependency or code scanning.",
      "Document observability expectations."
    ],
    learningAdvice: [
      "Practice containerization first, then CI and security scanning.",
      "Keep improvements small and verifiable."
    ]
  },
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

function createFallbackGuidedMissions(): NonNullable<DevOpsReport["guidedMissions"]> {
  return [
    createFallbackMission({
      id: "mission-containers",
      order: 1,
      title: "Contenedores reproducibles",
      category: "containerization",
      summary:
        "El repositorio coordina servicios con Compose, pero no muestra una receta de imagen para la aplicacion.",
      goal: "Entender la diferencia entre Dockerfile, imagen y Compose creando una primera imagen reproducible.",
      whyNow:
        "No se detecto un Dockerfile visible. Esta es una inferencia basada en el arbol de archivos, no una auditoria definitiva.",
      evidenceLabel: "Dockerfile detectado",
      evidenceDetail: "No se encontro una ruta visible para construir una imagen de contenedor.",
      conceptIds: ["dockerfile"],
      labId: "lab-dockerfile",
      suggestedFiles: ["Dockerfile", ".dockerignore", "package.json"],
      commands: ["docker build -t redevops-lab .", "docker run --rm redevops-lab"],
      steps: [
        "Identifica el comando de build y arranque del proyecto.",
        "Crea un Dockerfile minimo que instale dependencias y arranque la aplicacion.",
        "Agrega .dockerignore y construye la imagen localmente."
      ],
      expectedOutcome: "Puedes construir una imagen y explicar que contiene.",
      completionCriteria: [
        "La imagen se construye sin secretos locales.",
        "El comando de arranque esta documentado."
      ],
      question: "Que describe principalmente un Dockerfile?",
      answers: [
        ["Como construir una imagen reproducible", true],
        ["Que contenedores estan ejecutandose ahora", false],
        ["La lista de usuarios de GitHub", false]
      ],
      explanation:
        "El Dockerfile es la receta de construccion; Compose coordina servicios en ejecucion."
    }),
    createFallbackMission({
      id: "mission-security",
      order: 2,
      title: "Seguridad inicial",
      category: "security",
      summary: "No aparecen senales de escaneo automatico de dependencias, codigo o secretos.",
      goal: "Agregar una primera alerta automatica sin asumir que el escaneo garantiza seguridad total.",
      whyNow: "La categoria de seguridad tiene una brecha de alta prioridad en este reporte.",
      evidenceLabel: "Security scanning detectado",
      evidenceDetail: "No se detectaron workflows visibles de analisis de seguridad.",
      conceptIds: [],
      labId: "lab-security-scanning",
      suggestedFiles: [".github/dependabot.yml", ".github/workflows/security.yml"],
      commands: ["pnpm audit"],
      steps: [
        "Elige una comprobacion pequena: dependencias, codigo o secretos.",
        "Agrega la configuracion en una rama y ejecutala primero de forma manual.",
        "Documenta donde se revisan los hallazgos y quien decide si bloquean un merge."
      ],
      expectedOutcome: "Los riesgos conocidos aparecen antes del despliegue.",
      completionCriteria: [
        "La comprobacion produce un resultado visible.",
        "El equipo sabe como responder a un hallazgo."
      ],
      question: "Que aporta un escaneo de seguridad automatico?",
      answers: [
        ["Una alerta temprana sobre riesgos conocidos", true],
        ["La garantia de cero vulnerabilidades", false],
        ["Permiso para publicar secretos", false]
      ],
      explanation:
        "El escaneo reduce riesgo y acelera hallazgos, pero no garantiza seguridad total."
    }),
    createFallbackMission({
      id: "mission-observability",
      order: 3,
      title: "Visibilidad operativa",
      category: "observability",
      summary:
        "Existe un health check, pero el arbol de archivos no confirma logs estructurados ni metricas.",
      goal: "Distinguir salud, logs y metricas agregando una senal operativa pequena.",
      whyNow:
        "La aplicacion puede indicar que esta viva, pero aun cuesta explicar por que falla o se vuelve lenta.",
      evidenceLabel: "Logging o metricas detectadas",
      evidenceDetail: "La evidencia actual solo confirma un endpoint de health.",
      conceptIds: ["health-check"],
      labId: "lab-observability",
      suggestedFiles: ["apps/api/src/modules/health", "docs/observability.md"],
      commands: ["curl http://localhost:3001/api/health"],
      steps: [
        "Ejecuta el health check y observa que informacion entrega.",
        "Agrega o documenta un log util para arranque y errores.",
        "Provoca una comprobacion controlada y confirma que la senal sea entendible."
      ],
      expectedOutcome:
        "Puedes verificar que el servicio esta vivo y localizar una primera pista cuando falla.",
      completionCriteria: [
        "El health check responde de forma predecible.",
        "Existe una senal util para diagnostico inicial."
      ],
      question: "Que te dice un health check?",
      answers: [
        ["Si el servicio responde a una comprobacion basica", true],
        ["La causa exacta de cualquier error", false],
        ["Todo el rendimiento historico", false]
      ],
      explanation:
        "El health check es una senal minima. Logs y metricas explican mejor que esta ocurriendo."
    })
  ];
}

interface FallbackMissionInput {
  id: string;
  order: number;
  title: string;
  category: NonNullable<DevOpsReport["guidedMissions"]>[number]["category"];
  summary: string;
  goal: string;
  whyNow: string;
  evidenceLabel: string;
  evidenceDetail: string;
  conceptIds: string[];
  labId: string;
  suggestedFiles: string[];
  commands: string[];
  steps: string[];
  expectedOutcome: string;
  completionCriteria: string[];
  question: string;
  answers: Array<[string, boolean]>;
  explanation: string;
}

function createFallbackMission(
  input: FallbackMissionInput
): NonNullable<DevOpsReport["guidedMissions"]>[number] {
  return {
    id: input.id,
    order: input.order,
    title: input.title,
    category: input.category,
    summary: input.summary,
    plainLanguageGoal: input.goal,
    whyNow: input.whyNow,
    estimatedTime: "30-60 min",
    evidenceLevel: "needs-review",
    evidenceReason:
      "Este es un reporte local de respaldo. Confirma la evidencia en el repositorio antes de cambiarlo.",
    evidence: [
      {
        id: `${input.id}-evidence`,
        label: input.evidenceLabel,
        detail: input.evidenceDetail,
        level: "needs-review",
        files: []
      }
    ],
    conceptIds: input.conceptIds,
    labId: input.labId,
    prerequisites: ["Trabajar en una rama", "Guardar el estado actual antes de editar"],
    suggestedFiles: input.suggestedFiles,
    commands: input.commands,
    steps: input.steps.map((instruction, index) => ({
      id: `${input.id}-step-${index + 1}`,
      title:
        ["Entiende el punto de partida", "Haz el cambio mas pequeno", "Comprueba el resultado"][
          index
        ] ?? "Documenta lo aprendido",
      instruction
    })),
    expectedOutcome: input.expectedOutcome,
    completionCriteria: input.completionCriteria,
    knowledgeCheck: {
      question: input.question,
      options: input.answers.map(([label, correct], index) => ({
        id: `option-${index + 1}`,
        label,
        correct,
        feedback: correct
          ? "Correcto. Esa es la idea clave."
          : "Casi. Revisa la explicacion y prueba otra vez."
      })),
      explanation: input.explanation
    },
    completionMessage: `Ya puedes explicar ${input.title.toLowerCase()} usando evidencia del repositorio.`
  };
}
