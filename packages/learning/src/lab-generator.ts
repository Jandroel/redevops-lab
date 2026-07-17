import type {
  DevOpsLab,
  DevOpsScoreSummary,
  ExperienceLevel,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage,
  RepositoryAnalysis
} from "@redevops-lab/shared";
import { localized, unique } from "./localization.js";

export interface GenerateHandsOnLabsInput {
  analysis: RepositoryAnalysis;
  score: DevOpsScoreSummary;
  checklist: ProductionChecklistItem[];
  learningPath: LearningPathStep[];
  level: ExperienceLevel;
  language: ReportLanguage;
}

interface LabCandidate extends DevOpsLab {
  when: (context: LabContext) => boolean;
}

interface LabContext {
  analysis: RepositoryAnalysis;
  checklist: ProductionChecklistItem[];
  score: DevOpsScoreSummary;
  level: ExperienceLevel;
  language: ReportLanguage;
  pathLabIds: Set<string>;
  existingFiles: Set<string>;
  stack: Set<string>;
}

type BeginnerGuidance = Pick<
  DevOpsLab,
  | "conceptIds"
  | "prerequisites"
  | "commands"
  | "expectedOutcome"
  | "commonMistakes"
  | "completionCriteria"
  | "verificationChecklist"
>;

export function generateHandsOnLabs(input: GenerateHandsOnLabsInput): DevOpsLab[] {
  const context = createLabContext(input);
  const candidates = createLabCandidates(context);
  const selected = candidates.filter((candidate) => candidate.when(context));
  const pathOrdered = candidates.filter((candidate) => context.pathLabIds.has(candidate.id));
  const labs = uniqueLabs([...selected, ...pathOrdered, ...candidates]).slice(0, 8);
  const selectedLabs = labs.length >= 4 ? labs : uniqueLabs([...labs, ...candidates]).slice(0, 4);

  return selectedLabs.map((lab) => withBeginnerGuidance(lab, context));
}

function createLabCandidates(context: LabContext): LabCandidate[] {
  const { language } = context;

  return [
    {
      id: "lab-env-example",
      title: localized(language, "Crea un archivo de entorno de ejemplo", "Create an environment example file"),
      difficulty: "beginner",
      objective: localized(
        language,
        "Documentar las variables necesarias para ejecutar el proyecto.",
        "Document the variables required to run the project."
      ),
      whyItMatters: localized(
        language,
        "Reduce friccion para nuevos contribuidores y evita compartir secretos reales.",
        "It lowers onboarding friction and avoids sharing real secrets."
      ),
      suggestedFiles: suggestFiles(context, [".env.example", "README.md"]),
      steps: [
        localized(language, "Lista las variables que el proyecto espera en runtime.", "List the variables the project expects at runtime."),
        localized(language, "Crea .env.example con nombres y valores falsos.", "Create .env.example with names and fake values."),
        localized(language, "Documenta como copiarlo a .env.local o al entorno de despliegue.", "Document how to copy it to .env.local or deployment settings."),
        localized(language, "Verifica que ningun secreto real quede escrito.", "Verify that no real secret is committed.")
      ],
      validation: localized(
        language,
        "Un nuevo desarrollador puede configurar el proyecto usando README y .env.example.",
        "A new developer can configure the project using README and .env.example."
      ),
      estimatedTime: "20-30 min",
      category: "configuration",
      when: (ctx) => needs(ctx, "configuration.env_example") || lowEvidence(ctx)
    },
    {
      id: "lab-dockerfile",
      title: localized(language, "Conteneriza la aplicacion con Docker", "Containerize the application with Docker"),
      difficulty: "beginner",
      objective: localized(
        language,
        "Crear una ruta reproducible para construir una imagen de la aplicacion.",
        "Create a reproducible path to build an application image."
      ),
      whyItMatters: localized(
        language,
        "Docker hace que desarrollo, CI y despliegue compartan una base mas consistente.",
        "Docker gives development, CI, and deployment a more consistent base."
      ),
      suggestedFiles: suggestFiles(context, dockerFiles(context)),
      steps: [
        localized(language, "Identifica el comando de build o arranque del stack detectado.", "Identify the build or start command for the detected stack."),
        localized(language, "Crea un Dockerfile minimo para instalar dependencias y arrancar la app.", "Create a minimal Dockerfile to install dependencies and start the app."),
        localized(language, "Agrega .dockerignore para excluir dependencias, builds locales y secretos.", "Add .dockerignore to exclude dependencies, local builds, and secrets."),
        localized(language, "Documenta el comando docker build recomendado.", "Document the recommended docker build command.")
      ],
      validation: localized(
        language,
        "La imagen se puede construir localmente y la documentacion explica como ejecutarla.",
        "The image can be built locally and documentation explains how to run it."
      ),
      estimatedTime: "30-45 min",
      category: "containerization",
      when: (ctx) => needs(ctx, "containerization.dockerfile")
    },
    {
      id: "lab-docker-compose",
      title: localized(
        language,
        "Crea un entorno local reproducible con Docker Compose",
        "Create a reproducible local environment with Docker Compose"
      ),
      difficulty: "beginner",
      objective: localized(
        language,
        "Definir servicios locales necesarios para trabajar sin configuracion manual.",
        "Define local services needed to work without manual setup."
      ),
      whyItMatters: localized(
        language,
        "Compose reduce diferencias entre maquinas y acelera pruebas locales.",
        "Compose reduces machine-to-machine drift and speeds up local testing."
      ),
      suggestedFiles: suggestFiles(context, ["docker-compose.yml", ".env.example", "README.md"]),
      steps: [
        localized(language, "Lista servicios externos como base de datos, cache o cola.", "List external services such as database, cache, or queue."),
        localized(language, "Crea docker-compose.yml con servicios y variables necesarias.", "Create docker-compose.yml with required services and variables."),
        localized(language, "Agrega instrucciones de arranque y apagado al README.", "Add start and stop instructions to the README."),
        localized(language, "Valida la configuracion con docker compose config.", "Validate the configuration with docker compose config.")
      ],
      validation: localized(
        language,
        "docker compose config valida y el README explica el flujo local.",
        "docker compose config validates and the README explains the local flow."
      ),
      estimatedTime: "25-40 min",
      category: "containerization",
      when: (ctx) => needs(ctx, "containerization.compose")
    },
    {
      id: "lab-ci-workflow",
      title: localized(language, "Crea un workflow CI para pull requests", "Create a CI workflow for pull requests"),
      difficulty: "intermediate",
      objective: localized(
        language,
        "Automatizar instalacion, validaciones y build antes de mergear.",
        "Automate install, checks, and build before merging."
      ),
      whyItMatters: localized(
        language,
        "CI convierte las reglas del proyecto en una barrera visible y repetible.",
        "CI turns project rules into a visible and repeatable quality gate."
      ),
      suggestedFiles: suggestFiles(context, ciFiles(context)),
      steps: [
        localized(language, "Elige los comandos reales de lint, test, typecheck y build.", "Choose the real lint, test, typecheck, and build commands."),
        localized(language, "Crea .github/workflows/ci.yml con triggers para pull_request.", "Create .github/workflows/ci.yml with pull_request triggers."),
        localized(language, "Configura cache de dependencias solo si ya esta claro el gestor usado.", "Configure dependency cache only when the package manager is clear."),
        localized(language, "Documenta que valida el workflow y que queda pendiente.", "Document what the workflow validates and what remains pending.")
      ],
      validation: localized(
        language,
        "Un pull request ejecuta las validaciones principales del proyecto.",
        "A pull request runs the project's main validation checks."
      ),
      estimatedTime: "35-50 min",
      category: "ci_cd",
      when: (ctx) => needs(ctx, "ci_cd.pipeline") || needs(ctx, "ci_cd.tests_build")
    },
    {
      id: "lab-security-scanning",
      title: localized(language, "Agrega escaneo de dependencias y codigo", "Add dependency and code scanning"),
      difficulty: "intermediate",
      objective: localized(
        language,
        "Detectar riesgos de dependencias, codigo o secretos antes del despliegue.",
        "Detect dependency, code, or secret risks before deployment."
      ),
      whyItMatters: localized(
        language,
        "El escaneo temprano reduce riesgo de supply chain y errores repetidos.",
        "Early scanning reduces supply-chain risk and repeated mistakes."
      ),
      suggestedFiles: suggestFiles(context, [".github/dependabot.yml", ".github/workflows/security.yml", "SECURITY.md"]),
      steps: [
        localized(language, "Agrega Dependabot para el ecosistema principal del repositorio.", "Add Dependabot for the repository's main ecosystem."),
        localized(language, "Evalua CodeQL, Semgrep, Trivy o Gitleaks segun el stack.", "Evaluate CodeQL, Semgrep, Trivy, or Gitleaks for the stack."),
        localized(language, "Define cuando falla el workflow y cuando solo reporta.", "Define when the workflow fails and when it only reports."),
        localized(language, "Documenta como revisar hallazgos de seguridad.", "Document how to review security findings.")
      ],
      validation: localized(
        language,
        "Los resultados de seguridad quedan visibles en pull requests o en la pestana Security.",
        "Security results are visible on pull requests or in the Security tab."
      ),
      estimatedTime: "40-60 min",
      category: "security",
      when: (ctx) => needs(ctx, "security.scanning") || needs(ctx, "security.dependabot")
    },
    {
      id: "lab-observability",
      title: localized(language, "Agrega health check y logging basico", "Add a health check and basic logging"),
      difficulty: "intermediate",
      objective: localized(
        language,
        "Exponer una senal minima para saber si la aplicacion responde correctamente.",
        "Expose a minimum signal to know whether the application responds correctly."
      ),
      whyItMatters: localized(
        language,
        "Sin senales operativas, los fallos son mas dificiles de detectar y explicar.",
        "Without operational signals, failures are harder to detect and explain."
      ),
      suggestedFiles: suggestFiles(context, observabilityFiles(context)),
      steps: [
        localized(language, "Define una respuesta /health o equivalente para el stack.", "Define a /health response or equivalent for the stack."),
        localized(language, "Agrega logging basico para arranque, errores y requests importantes.", "Add basic logging for startup, errors, and important requests."),
        localized(language, "Documenta que endpoint o comando debe revisar un monitor.", "Document which endpoint or command a monitor should check."),
        localized(language, "Evita afirmar metricas si todavia no existe instrumentacion real.", "Avoid claiming metrics if real instrumentation does not exist yet.")
      ],
      validation: localized(
        language,
        "Existe una senal verificable de salud y la documentacion explica como usarla.",
        "A verifiable health signal exists and documentation explains how to use it."
      ),
      estimatedTime: "30-45 min",
      category: "observability",
      when: (ctx) => needs(ctx, "observability.health") || needs(ctx, "observability.logging_metrics")
    },
    {
      id: "lab-deployment-docs",
      title: localized(language, "Documenta el proceso de despliegue", "Document the deployment process"),
      difficulty: "beginner",
      objective: localized(
        language,
        "Hacer reproducible la preparacion, despliegue y verificacion de una version.",
        "Make release preparation, deployment, and verification reproducible."
      ),
      whyItMatters: localized(
        language,
        "Una guia clara evita conocimiento tribal y errores de handoff.",
        "A clear guide avoids tribal knowledge and handoff mistakes."
      ),
      suggestedFiles: suggestFiles(context, ["docs/deployment.md", "README.md"]),
      steps: [
        localized(language, "Anota prerequisitos, variables y servicios externos.", "Write prerequisites, variables, and external services."),
        localized(language, "Describe build, deploy y verificacion post-deploy.", "Describe build, deploy, and post-deploy verification."),
        localized(language, "Incluye rollback manual si todavia no hay automatizacion.", "Include manual rollback if automation does not exist yet."),
        localized(language, "Marca claramente los pasos pendientes o asumidos.", "Clearly mark pending or assumed steps.")
      ],
      validation: localized(
        language,
        "Otra persona puede seguir la guia sin depender de explicaciones privadas.",
        "Another person can follow the guide without private explanations."
      ),
      estimatedTime: "25-40 min",
      category: "documentation",
      when: (ctx) => needs(ctx, "documentation.deployment") || needs(ctx, "documentation.readme")
    },
    {
      id: "lab-infrastructure-as-code",
      title: localized(language, "Introduce infraestructura como codigo", "Introduce infrastructure as code"),
      difficulty: "advanced",
      objective: localized(
        language,
        "Versionar infraestructura cuando el proyecto ya tenga destino de despliegue claro.",
        "Version infrastructure once the project has a clear deployment target."
      ),
      whyItMatters: localized(
        language,
        "IaC permite revisar cambios de infraestructura igual que codigo de aplicacion.",
        "IaC lets infrastructure changes be reviewed like application code."
      ),
      suggestedFiles: suggestFiles(context, ["terraform/", "k8s/", "helm/", "docs/infrastructure.md"]),
      steps: [
        localized(language, "Elige un alcance pequeno: red, servicio, base de datos o deployment.", "Choose a small scope: network, service, database, or deployment."),
        localized(language, "Documenta variables, estado remoto y entorno objetivo.", "Document variables, remote state, and target environment."),
        localized(language, "Agrega validacion o plan en CI antes de aplicar cambios.", "Add validation or plan in CI before applying changes."),
        localized(language, "Mantiene esta practica opcional si el repo aun no esta listo para deploy.", "Keep this practice optional if the repo is not ready for deployment yet.")
      ],
      validation: localized(
        language,
        "Existe una primera definicion revisable y documentada de infraestructura.",
        "A first reviewable and documented infrastructure definition exists."
      ),
      estimatedTime: "60-90 min",
      category: "infrastructure",
      when: (ctx) => ctx.level === "advanced" && needs(ctx, "infrastructure.iac_or_orchestration")
    },
    {
      id: "lab-production-docker",
      title: localized(language, "Mejora la imagen Docker de produccion", "Improve the production Docker image"),
      difficulty: "advanced",
      objective: localized(
        language,
        "Reducir tamanio, separar build/runtime y preparar una imagen mas segura.",
        "Reduce size, separate build/runtime, and prepare a safer image."
      ),
      whyItMatters: localized(
        language,
        "Una imagen mas pequena y explicita facilita despliegues y revisiones.",
        "A smaller and more explicit image improves deployments and reviews."
      ),
      suggestedFiles: suggestFiles(context, ["Dockerfile", ".dockerignore", "README.md"]),
      steps: [
        localized(language, "Evalua si un build multi-stage aplica al stack.", "Evaluate whether a multi-stage build applies to the stack."),
        localized(language, "Separa dependencias de build y runtime cuando sea posible.", "Separate build and runtime dependencies when possible."),
        localized(language, "Ejecuta la app con usuario no root si el stack lo permite.", "Run the app with a non-root user when the stack allows it."),
        localized(language, "Documenta tags, puertos y variables esperadas.", "Document tags, ports, and expected variables.")
      ],
      validation: localized(
        language,
        "La imagen mantiene el comportamiento esperado y reduce supuestos de runtime.",
        "The image keeps expected behavior and reduces runtime assumptions."
      ),
      estimatedTime: "45-75 min",
      category: "containerization",
      when: (ctx) => ctx.score.percentage >= 65 || ctx.level === "advanced"
    },
    {
      id: "lab-observability-dashboard",
      title: localized(language, "Disena dashboards de observabilidad", "Design observability dashboards"),
      difficulty: "advanced",
      objective: localized(
        language,
        "Definir vistas iniciales para salud, errores, latencia y saturacion.",
        "Define initial views for health, errors, latency, and saturation."
      ),
      whyItMatters: localized(
        language,
        "Los dashboards conectan senales tecnicas con decisiones operativas.",
        "Dashboards connect technical signals with operational decisions."
      ),
      suggestedFiles: suggestFiles(context, ["docs/observability.md", "grafana/", "prometheus.yml"]),
      steps: [
        localized(language, "Lista las preguntas operativas que el dashboard debe responder.", "List the operational questions the dashboard should answer."),
        localized(language, "Relaciona cada pregunta con una metrica, log o traza.", "Map each question to a metric, log, or trace."),
        localized(language, "Documenta umbrales iniciales y acciones esperadas.", "Document initial thresholds and expected actions."),
        localized(language, "Marca claramente cualquier senal aun no instrumentada.", "Clearly mark any signal that is not instrumented yet.")
      ],
      validation: localized(
        language,
        "El equipo sabe que mirar durante incidentes o revisiones de release.",
        "The team knows what to inspect during incidents or release reviews."
      ),
      estimatedTime: "45-70 min",
      category: "observability",
      when: (ctx) => ctx.score.percentage >= 70 || ctx.level === "advanced"
    },
    {
      id: "lab-rollback-strategy",
      title: localized(language, "Documenta una estrategia de rollback", "Document a rollback strategy"),
      difficulty: "advanced",
      objective: localized(
        language,
        "Preparar pasos claros si un despliegue debe revertirse.",
        "Prepare clear steps if a deployment must be reverted."
      ),
      whyItMatters: localized(
        language,
        "Rollback reduce el tiempo de recuperacion cuando una version falla.",
        "Rollback reduces recovery time when a release fails."
      ),
      suggestedFiles: suggestFiles(context, ["docs/deployment.md", "docs/runbooks/rollback.md"]),
      steps: [
        localized(language, "Define que senales indican que hay que revertir.", "Define which signals indicate a rollback is needed."),
        localized(language, "Describe como identificar la version estable previa.", "Describe how to identify the previous stable version."),
        localized(language, "Documenta pasos manuales y automatizables.", "Document manual and automatable steps."),
        localized(language, "Agrega una verificacion post-rollback.", "Add post-rollback verification.")
      ],
      validation: localized(
        language,
        "La guia permite revertir una version sin improvisar pasos criticos.",
        "The guide allows a release to be reverted without improvising critical steps."
      ),
      estimatedTime: "35-60 min",
      category: "ci_cd",
      when: (ctx) => ctx.score.percentage >= 65 || ctx.level === "advanced"
    },
    {
      id: "lab-deployment-strategy",
      title: localized(language, "Refina la estrategia de despliegue", "Refine the deployment strategy"),
      difficulty: "advanced",
      objective: localized(
        language,
        "Conectar ambientes, verificaciones, aprobaciones y rollback en una guia unica.",
        "Connect environments, checks, approvals, and rollback in one guide."
      ),
      whyItMatters: localized(
        language,
        "Una estrategia visible reduce sorpresas cuando el proyecto empieza a operar con usuarios reales.",
        "A visible strategy reduces surprises once the project starts serving real users."
      ),
      suggestedFiles: suggestFiles(context, ["docs/deployment.md", "docs/release-strategy.md"]),
      steps: [
        localized(language, "Define ambientes y criterios para promover una version.", "Define environments and criteria for promoting a release."),
        localized(language, "Relaciona CI, checks manuales y verificaciones post-deploy.", "Connect CI, manual checks, and post-deploy verification."),
        localized(language, "Documenta responsabilidades y puntos de aprobacion.", "Document responsibilities and approval points."),
        localized(language, "Incluye una decision clara para rollback.", "Include a clear rollback decision.")
      ],
      validation: localized(
        language,
        "La estrategia explica cuando desplegar, cuando detenerse y como recuperarse.",
        "The strategy explains when to deploy, when to stop, and how to recover."
      ),
      estimatedTime: "45-70 min",
      category: "documentation",
      when: (ctx) => ctx.score.percentage >= 70 || ctx.level === "advanced"
    },
    {
      id: "lab-infrastructure-validation",
      title: localized(language, "Agrega validacion de infraestructura", "Add infrastructure validation"),
      difficulty: "advanced",
      objective: localized(
        language,
        "Validar cambios de infraestructura antes de aplicarlos.",
        "Validate infrastructure changes before applying them."
      ),
      whyItMatters: localized(
        language,
        "La validacion temprana evita cambios peligrosos en recursos compartidos.",
        "Early validation avoids risky changes to shared resources."
      ),
      suggestedFiles: suggestFiles(context, ["terraform/", ".github/workflows/infra.yml", "docs/infrastructure.md"]),
      steps: [
        localized(language, "Elige una herramienta de validacion para el IaC usado.", "Choose a validation tool for the IaC in use."),
        localized(language, "Agrega formato, validate o plan al workflow.", "Add format, validate, or plan to the workflow."),
        localized(language, "Define que requiere revision humana.", "Define what requires human review."),
        localized(language, "Documenta limites de la validacion actual.", "Document the limits of the current validation.")
      ],
      validation: localized(
        language,
        "Un cambio de infraestructura puede revisarse antes de aplicarse.",
        "An infrastructure change can be reviewed before it is applied."
      ),
      estimatedTime: "60-90 min",
      category: "infrastructure",
      when: (ctx) => ctx.score.percentage >= 70 || ctx.level === "advanced"
    }
  ];
}

function withBeginnerGuidance(lab: DevOpsLab, context: LabContext): DevOpsLab {
  const guidance = createBeginnerGuidance(lab, context);

  return {
    ...lab,
    ...guidance,
    conceptIds: unique([...(lab.conceptIds ?? []), ...(guidance.conceptIds ?? [])]),
    prerequisites: unique([...(lab.prerequisites ?? []), ...(guidance.prerequisites ?? [])]),
    commands: unique([...(lab.commands ?? []), ...(guidance.commands ?? [])]),
    commonMistakes: unique([...(lab.commonMistakes ?? []), ...(guidance.commonMistakes ?? [])]),
    completionCriteria: unique([...(lab.completionCriteria ?? []), ...(guidance.completionCriteria ?? [])]),
    verificationChecklist: unique([
      ...(lab.verificationChecklist ?? []),
      ...(guidance.verificationChecklist ?? [])
    ])
  };
}

function createBeginnerGuidance(lab: DevOpsLab, context: LabContext): BeginnerGuidance {
  const { language } = context;
  const category = lab.category ?? "documentation";
  const concepts = conceptIdsForLab(lab);

  return {
    conceptIds: concepts,
    prerequisites: prerequisitesForLab(lab, context),
    commands: commandsForLab(lab, context),
    expectedOutcome: expectedOutcomeForLab(lab, language),
    commonMistakes: commonMistakesForCategory(category, language),
    completionCriteria: completionCriteriaForLab(lab, language),
    verificationChecklist: verificationChecklistForLab(lab, language)
  };
}

function conceptIdsForLab(lab: DevOpsLab): string[] {
  const byLabId: Record<string, string[]> = {
    "lab-env-example": ["environment-variable", "secret-hygiene"],
    "lab-dockerfile": ["dockerfile", "container-image"],
    "lab-docker-compose": ["docker-compose", "environment-variable"],
    "lab-ci-workflow": ["ci-pipeline", "quality-gate"],
    "lab-security-scanning": ["dependency-scanning", "supply-chain-security", "secret-hygiene"],
    "lab-observability": ["health-check", "structured-logging"],
    "lab-deployment-docs": ["runbook", "health-check"],
    "lab-infrastructure-as-code": ["iac"],
    "lab-production-docker": ["dockerfile", "container-image", "supply-chain-security"],
    "lab-observability-dashboard": ["metrics", "structured-logging", "health-check"],
    "lab-rollback-strategy": ["rollback", "runbook", "health-check"],
    "lab-deployment-strategy": ["runbook", "rollback", "quality-gate"],
    "lab-infrastructure-validation": ["iac", "quality-gate"]
  };

  const byCategory: Record<NonNullable<DevOpsLab["category"]>, string[]> = {
    configuration: ["environment-variable", "secret-hygiene"],
    containerization: ["dockerfile", "container-image"],
    ci_cd: ["ci-pipeline", "quality-gate"],
    security: ["dependency-scanning", "supply-chain-security"],
    observability: ["health-check", "structured-logging"],
    documentation: ["runbook", "repository-signal"],
    infrastructure: ["iac"]
  };

  return byLabId[lab.id] ?? (lab.category ? byCategory[lab.category] : ["repository-signal"]);
}

function prerequisitesForLab(lab: DevOpsLab, context: LabContext): string[] {
  const { language } = context;
  const common = [
    localized(language, "Repositorio clonado y cambios en una rama de trabajo.", "Repository cloned and changes made on a working branch."),
    localized(language, "README revisado para entender como se ejecuta el proyecto.", "README reviewed to understand how the project runs.")
  ];
  const byLabId: Record<string, string[]> = {
    "lab-env-example": [
      localized(language, "Lista inicial de variables que la app usa en runtime.", "Initial list of variables the app uses at runtime.")
    ],
    "lab-dockerfile": [
      localized(language, "Docker instalado localmente o disponible en CI.", "Docker installed locally or available in CI."),
      localized(language, "Comando real para instalar, compilar o iniciar la app.", "Real command to install, build, or start the app.")
    ],
    "lab-docker-compose": [
      localized(language, "Docker Compose disponible.", "Docker Compose available."),
      localized(language, ".env.example revisado para no inyectar secretos reales.", ".env.example reviewed to avoid injecting real secrets.")
    ],
    "lab-ci-workflow": [
      localized(language, "Comandos reales de validacion identificados.", "Real validation commands identified."),
      localized(language, "Permisos para agregar archivos en .github/workflows.", "Permission to add files under .github/workflows.")
    ],
    "lab-security-scanning": [
      localized(language, "Gestor de paquetes principal identificado.", "Main package manager identified."),
      localized(language, "Criterio inicial para decidir que hallazgos bloquean el merge.", "Initial criterion for deciding which findings block merge.")
    ],
    "lab-observability": [
      localized(language, "La aplicacion puede ejecutarse localmente.", "The application can run locally."),
      localized(language, "Ruta o modulo donde se exponen endpoints del servicio.", "Route or module where service endpoints are exposed.")
    ],
    "lab-infrastructure-as-code": [
      localized(language, "Proveedor o plataforma objetivo definido aunque sea de forma preliminar.", "Target provider or platform defined, even preliminarily.")
    ],
    "lab-production-docker": [
      localized(language, "Dockerfile base o comando de build ya entendido.", "Base Dockerfile or build command already understood.")
    ],
    "lab-observability-dashboard": [
      localized(language, "Senales operativas disponibles o documentadas como pendientes.", "Operational signals available or documented as pending.")
    ],
    "lab-rollback-strategy": [
      localized(language, "Existe una forma de identificar versiones o commits desplegados.", "There is a way to identify deployed versions or commits.")
    ],
    "lab-deployment-strategy": [
      localized(language, "Ambiente objetivo y responsables de despliegue definidos.", "Target environment and deployment owners defined.")
    ],
    "lab-infrastructure-validation": [
      localized(language, "Archivos de infraestructura o plan de introducirlos.", "Infrastructure files or a plan to introduce them.")
    ]
  };

  return unique([...common, ...(byLabId[lab.id] ?? [])]).slice(0, 4);
}

function commandsForLab(lab: DevOpsLab, context: LabContext): string[] {
  const packageManager = detectPackageManager(context);
  const byLabId: Record<string, string[]> = {
    "lab-env-example": ["cp .env.example .env.local", "git diff -- .env.example README.md"],
    "lab-dockerfile": ["docker build -t app-dev .", "docker run --rm -p 3000:3000 app-dev"],
    "lab-docker-compose": ["docker compose config", "docker compose up --build"],
    "lab-ci-workflow": [
      `${packageManager} install`,
      `${packageManager} test`,
      "git diff -- .github/workflows/ci.yml"
    ],
    "lab-security-scanning": [
      `${packageManager} audit`,
      "npx --yes gitleaks detect --source . --no-git"
    ],
    "lab-observability": [
      "curl http://localhost:3000/health",
      "curl http://localhost:3001/api/health"
    ],
    "lab-deployment-docs": ["git diff -- docs/deployment.md README.md"],
    "lab-infrastructure-as-code": ["terraform fmt -check", "terraform validate"],
    "lab-production-docker": [
      "docker build --target production -t app-production .",
      "docker run --rm app-production"
    ],
    "lab-observability-dashboard": ["git diff -- docs/observability.md"],
    "lab-rollback-strategy": ["git tag --list", "git revert <commit-sha> --no-commit"],
    "lab-deployment-strategy": ["git diff -- docs/deployment.md docs/release-strategy.md"],
    "lab-infrastructure-validation": ["terraform fmt -check", "terraform validate", "terraform plan"]
  };

  return byLabId[lab.id] ?? ["git status --short"];
}

function expectedOutcomeForLab(lab: DevOpsLab, language: ReportLanguage): string {
  const byLabId: Record<string, string> = {
    "lab-env-example": localized(
      language,
      "El repositorio muestra que variables existen, cuales son falsas y donde configurar valores reales.",
      "The repository shows which variables exist, which values are fake, and where to configure real values."
    ),
    "lab-dockerfile": localized(
      language,
      "Existe una imagen reproducible que puede construirse sin depender de instrucciones manuales.",
      "A reproducible image exists and can be built without relying on manual instructions."
    ),
    "lab-docker-compose": localized(
      language,
      "El entorno local se puede levantar con un comando documentado.",
      "The local environment can be started with one documented command."
    ),
    "lab-ci-workflow": localized(
      language,
      "Cada pull request tiene una validacion automatica visible.",
      "Each pull request has a visible automated validation."
    ),
    "lab-security-scanning": localized(
      language,
      "El equipo recibe senales tempranas sobre dependencias, secretos o codigo riesgoso.",
      "The team receives early signals about dependencies, secrets, or risky code."
    ),
    "lab-observability": localized(
      language,
      "Existe una primera respuesta verificable para saber si el servicio esta vivo.",
      "A first verifiable response exists to know whether the service is alive."
    ),
    "lab-deployment-docs": localized(
      language,
      "Una persona puede seguir la guia de despliegue sin conocimiento tribal.",
      "A person can follow the deployment guide without tribal knowledge."
    )
  };

  return (
    byLabId[lab.id] ??
    localized(
      language,
      "La practica queda documentada, verificable y conectada con evidencia del repositorio.",
      "The practice becomes documented, verifiable, and connected to repository evidence."
    )
  );
}

function commonMistakesForCategory(
  category: NonNullable<DevOpsLab["category"]> | "documentation",
  language: ReportLanguage
): string[] {
  const common = [
    localized(language, "Copiar ejemplos sin adaptarlos al stack real.", "Copying examples without adapting them to the real stack."),
    localized(language, "No documentar que queda pendiente o asumido.", "Not documenting what remains pending or assumed.")
  ];
  const byCategory: Record<NonNullable<DevOpsLab["category"]>, string[]> = {
    configuration: [
      localized(language, "Subir valores reales en .env.example.", "Committing real values in .env.example.")
    ],
    containerization: [
      localized(language, "Incluir node_modules, dist o secretos dentro de la imagen.", "Including node_modules, dist, or secrets inside the image.")
    ],
    ci_cd: [
      localized(language, "Crear un workflow que pasa aunque no ejecute validaciones reales.", "Creating a workflow that passes without running real validations.")
    ],
    security: [
      localized(language, "Activar escaneos sin definir como revisar o priorizar hallazgos.", "Enabling scans without defining how findings are reviewed or prioritized.")
    ],
    observability: [
      localized(language, "Confundir health check con monitoreo completo.", "Confusing a health check with complete monitoring.")
    ],
    documentation: [
      localized(language, "Escribir pasos que solo funcionan en la maquina del autor.", "Writing steps that only work on the author's machine.")
    ],
    infrastructure: [
      localized(language, "Aplicar infraestructura sin plan, revision o entorno seguro.", "Applying infrastructure without a plan, review, or safe environment.")
    ]
  };

  return unique([...common, ...(byCategory[category] ?? [])]).slice(0, 4);
}

function completionCriteriaForLab(lab: DevOpsLab, language: ReportLanguage): string[] {
  return [
    localized(language, "El cambio deja evidencia en archivos versionados.", "The change leaves evidence in versioned files."),
    localized(language, "El README o docs explican como repetirlo.", "The README or docs explain how to repeat it."),
    localized(language, "La validacion del lab puede ejecutarse o revisarse manualmente.", "The lab validation can be run or reviewed manually."),
    localized(
      language,
      `La practica queda vinculada al hallazgo: ${lab.title}.`,
      `The practice is linked to the finding: ${lab.title}.`
    )
  ];
}

function verificationChecklistForLab(lab: DevOpsLab, language: ReportLanguage): string[] {
  return [
    localized(language, "Revise el diff y no incluye secretos.", "Review the diff and ensure it includes no secrets."),
    localized(language, "Ejecute al menos el comando de validacion principal.", "Run at least the main validation command."),
    localized(language, "Anote cualquier restriccion local o decision pendiente.", "Write down any local restriction or pending decision."),
    localized(language, `Confirme: ${lab.validation}`, `Confirm: ${lab.validation}`)
  ];
}

function detectPackageManager(context: LabContext): string {
  if (context.existingFiles.has("pnpm-lock.yaml")) {
    return "pnpm";
  }

  if (context.existingFiles.has("yarn.lock")) {
    return "yarn";
  }

  if (context.existingFiles.has("package-lock.json")) {
    return "npm";
  }

  return "npm";
}

function createLabContext({
  analysis,
  score,
  checklist,
  learningPath,
  level,
  language
}: GenerateHandsOnLabsInput): LabContext {
  const existingFiles = new Set(analysis.tree.filter((item) => item.type === "file").map((item) => item.path.toLowerCase()));
  const stack = new Set(analysis.detectedStack.map((item) => item.name.toLowerCase()));

  return {
    analysis,
    checklist,
    score,
    level,
    language,
    pathLabIds: new Set(learningPath.flatMap((step) => step.labs)),
    existingFiles,
    stack
  };
}

function needs(context: LabContext, id: string): boolean {
  const item = context.checklist.find((entry) => entry.id === id);

  return item?.status !== "done";
}

function lowEvidence(context: LabContext): boolean {
  const detectedSignals = context.analysis.devopsSignals.filter((signal) => signal.detected).length;

  return context.analysis.tree.length < 8 || detectedSignals <= 3;
}

function suggestFiles(context: LabContext, files: string[]): string[] {
  return unique(files).map((file) => {
    const normalized = file.toLowerCase().replace(/\/$/, "");
    const exists =
      context.existingFiles.has(normalized) ||
      [...context.existingFiles].some((existing) => existing.startsWith(`${normalized}/`));

    return exists ? file : `${file} (suggested)`;
  });
}

function dockerFiles(context: LabContext): string[] {
  if (hasAnyStack(context, ["python", "django", "fastapi"])) {
    return ["Dockerfile", ".dockerignore", "requirements.txt", "pyproject.toml"];
  }

  if (hasAnyStack(context, ["go"])) {
    return ["Dockerfile", ".dockerignore", "go.mod"];
  }

  if (hasAnyStack(context, ["java"])) {
    return ["Dockerfile", ".dockerignore", "pom.xml", "build.gradle"];
  }

  return ["Dockerfile", ".dockerignore", "package.json", "pnpm-lock.yaml"];
}

function ciFiles(context: LabContext): string[] {
  if (hasAnyStack(context, ["python", "django", "fastapi"])) {
    return [".github/workflows/ci.yml", "requirements.txt", "pyproject.toml"];
  }

  if (hasAnyStack(context, ["go"])) {
    return [".github/workflows/ci.yml", "go.mod"];
  }

  if (hasAnyStack(context, ["java"])) {
    return [".github/workflows/ci.yml", "pom.xml", "build.gradle"];
  }

  return [".github/workflows/ci.yml", "package.json", "pnpm-lock.yaml"];
}

function observabilityFiles(context: LabContext): string[] {
  if (hasAnyStack(context, ["nestjs", "next.js", "typescript", "javascript"])) {
    return ["apps/api/src/modules/health", "README.md", "docs/observability.md"];
  }

  if (hasAnyStack(context, ["python", "django", "fastapi"])) {
    return ["app/main.py", "README.md", "docs/observability.md"];
  }

  return ["README.md", "docs/observability.md"];
}

function hasAnyStack(context: LabContext, names: string[]): boolean {
  return names.some((name) => context.stack.has(name));
}

function uniqueLabs(labs: Array<LabCandidate | DevOpsLab>): DevOpsLab[] {
  const seen = new Set<string>();

  return labs
    .filter((lab) => {
      if (seen.has(lab.id)) {
        return false;
      }

      seen.add(lab.id);
      return true;
    })
    .map((lab) => {
      if ("when" in lab) {
        const { when: _when, ...devOpsLab } = lab;

        return devOpsLab;
      }

      return lab;
    });
}
