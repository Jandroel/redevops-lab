import type {
  DevOpsConcept,
  DevOpsLab,
  DevOpsScoreSummary,
  LearningPathStep,
  ProductionChecklistItem,
  ReportLanguage,
  RepositoryAnalysis
} from "@redevops-lab/shared";
import { localized } from "./localization.js";

export interface GenerateDevOpsConceptsInput {
  analysis: RepositoryAnalysis;
  score: DevOpsScoreSummary;
  checklist: ProductionChecklistItem[];
  learningPath: LearningPathStep[];
  labs: DevOpsLab[];
  language: ReportLanguage;
}

export function generateDevOpsConcepts({
  checklist,
  learningPath,
  labs,
  language
}: GenerateDevOpsConceptsInput): DevOpsConcept[] {
  const conceptIds = new Set<string>(["devops-feedback-loop", "repository-signal"]);
  const priorityCategories = new Set(
    checklist
      .filter((item) => item.status !== "done" || item.priority === "high")
      .map((item) => item.category)
  );

  for (const lab of labs) {
    for (const conceptId of lab.conceptIds ?? []) {
      conceptIds.add(conceptId);
    }
  }

  for (const step of learningPath) {
    for (const topic of step.topics ?? []) {
      const normalized = topic.toLowerCase();

      if (normalized.includes("docker") || normalized.includes("container")) {
        conceptIds.add("dockerfile");
        conceptIds.add("container-image");
      }

      if (normalized.includes("ci") || normalized.includes("pull request")) {
        conceptIds.add("ci-pipeline");
        conceptIds.add("quality-gate");
      }

      if (normalized.includes("security") || normalized.includes("seguridad")) {
        conceptIds.add("dependency-scanning");
        conceptIds.add("supply-chain-security");
      }

      if (normalized.includes("observ")) {
        conceptIds.add("health-check");
        conceptIds.add("structured-logging");
      }
    }
  }

  for (const category of priorityCategories) {
    for (const conceptId of categoryConcepts[category] ?? []) {
      conceptIds.add(conceptId);
    }
  }

  return conceptCatalog(language)
    .filter((concept) => conceptIds.has(concept.id))
    .slice(0, 18);
}

const categoryConcepts: Record<ProductionChecklistItem["category"], string[]> = {
  configuration: ["environment-variable", "secret-hygiene"],
  containerization: ["dockerfile", "container-image", "docker-compose"],
  ci_cd: ["ci-pipeline", "quality-gate", "rollback"],
  security: ["dependency-scanning", "supply-chain-security", "secret-hygiene"],
  observability: ["health-check", "structured-logging", "metrics"],
  documentation: ["runbook", "repository-signal"],
  infrastructure: ["iac", "kubernetes"]
};

function conceptCatalog(language: ReportLanguage): DevOpsConcept[] {
  return [
    {
      id: "devops-feedback-loop",
      term: localized(language, "Ciclo DevOps", "DevOps feedback loop"),
      category: "general",
      shortDefinition: localized(
        language,
        "Forma de mejorar software conectando codigo, automatizacion, despliegue y aprendizaje.",
        "A way to improve software by connecting code, automation, deployment, and learning."
      ),
      beginnerExplanation: localized(
        language,
        "DevOps no es una herramienta unica. Es un ciclo: cambias codigo, lo validas, lo despliegas, observas que paso y usas esa informacion para el siguiente cambio.",
        "DevOps is not one single tool. It is a loop: change code, validate it, deploy it, observe what happened, and use that feedback for the next change."
      ),
      whyItMatters: localized(
        language,
        "Ayuda a pasar de cambios manuales e inciertos a mejoras pequenas, verificables y repetibles.",
        "It helps move from uncertain manual changes to small, verifiable, repeatable improvements."
      ),
      example: localized(
        language,
        "Un pull request ejecuta CI, se despliega una version y luego un health check confirma si el servicio responde.",
        "A pull request runs CI, a version is deployed, and then a health check confirms whether the service responds."
      ),
      relatedTerms: ["ci-pipeline", "deployment", "observability"]
    },
    {
      id: "repository-signal",
      term: localized(language, "Senal del repositorio", "Repository signal"),
      category: "general",
      shortDefinition: localized(
        language,
        "Evidencia visible en archivos que sugiere una practica DevOps.",
        "Visible file evidence that suggests a DevOps practice."
      ),
      beginnerExplanation: localized(
        language,
        "ReDevOps Lab no adivina intenciones. Busca archivos como Dockerfile, workflows, README o docs para inferir que practicas ya existen.",
        "ReDevOps Lab does not guess intentions. It looks for files such as Dockerfile, workflows, README, or docs to infer which practices exist."
      ),
      whyItMatters: localized(
        language,
        "Una practica que no deja evidencia es dificil de repetir, auditar o ensenar a otra persona.",
        "A practice without evidence is hard to repeat, audit, or teach to another person."
      ),
      example: localized(
        language,
        ".github/workflows/ci.yml es una senal de CI; .env.example es una senal de configuracion documentada.",
        ".github/workflows/ci.yml is a CI signal; .env.example is a documented configuration signal."
      ),
      relatedTerms: ["quality-gate", "runbook"]
    },
    {
      id: "environment-variable",
      term: localized(language, "Variable de entorno", "Environment variable"),
      category: "configuration",
      shortDefinition: localized(
        language,
        "Valor de configuracion que cambia por ambiente sin modificar el codigo.",
        "A configuration value that changes by environment without modifying code."
      ),
      beginnerExplanation: localized(
        language,
        "La app puede necesitar puertos, URLs o claves. Esos valores viven fuera del codigo para que desarrollo, pruebas y produccion usen configuraciones distintas.",
        "An app may need ports, URLs, or keys. Those values live outside code so development, testing, and production can use different settings."
      ),
      whyItMatters: localized(
        language,
        "Evita editar codigo para desplegar y reduce el riesgo de subir secretos reales.",
        "It avoids editing code for deployment and reduces the risk of committing real secrets."
      ),
      example: localized(language, "NEXT_PUBLIC_API_URL=http://localhost:3001", "NEXT_PUBLIC_API_URL=http://localhost:3001"),
      relatedTerms: ["secret-hygiene"]
    },
    {
      id: "secret-hygiene",
      term: localized(language, "Higiene de secretos", "Secret hygiene"),
      category: "security",
      shortDefinition: localized(
        language,
        "Practica de mantener tokens, passwords y claves fuera del repositorio.",
        "The practice of keeping tokens, passwords, and keys out of the repository."
      ),
      beginnerExplanation: localized(
        language,
        "Un secreto filtrado puede dar acceso a APIs, servidores o datos. El repo debe mostrar nombres de variables, no valores reales.",
        "A leaked secret can grant access to APIs, servers, or data. The repo should show variable names, not real values."
      ),
      whyItMatters: localized(
        language,
        "Es una de las formas mas comunes y evitables de incidentes en proyectos reales.",
        "It is one of the most common and avoidable sources of incidents in real projects."
      ),
      example: localized(language, "OPENAI_API_KEY=your_api_key_here", "OPENAI_API_KEY=your_api_key_here"),
      relatedTerms: ["environment-variable", "dependency-scanning"]
    },
    {
      id: "dockerfile",
      term: "Dockerfile",
      category: "containerization",
      shortDefinition: localized(
        language,
        "Receta para construir una imagen de contenedor.",
        "A recipe for building a container image."
      ),
      beginnerExplanation: localized(
        language,
        "Describe paso a paso que sistema base usar, que dependencias instalar y que comando ejecuta la aplicacion.",
        "It describes step by step which base system to use, which dependencies to install, and which command runs the app."
      ),
      whyItMatters: localized(
        language,
        "Convierte la frase 'en mi maquina funciona' en un entorno reproducible para CI y despliegue.",
        "It turns 'works on my machine' into a reproducible environment for CI and deployment."
      ),
      example: localized(language, "FROM node:24-alpine + pnpm install + pnpm start", "FROM node:24-alpine + pnpm install + pnpm start"),
      relatedTerms: ["container-image", "docker-compose"]
    },
    {
      id: "container-image",
      term: localized(language, "Imagen de contenedor", "Container image"),
      category: "containerization",
      shortDefinition: localized(
        language,
        "Paquete ejecutable con la app y lo necesario para correrla.",
        "A runnable package with the app and what it needs to run."
      ),
      beginnerExplanation: localized(
        language,
        "La imagen es el resultado del Dockerfile. Se puede ejecutar localmente, probar en CI y subir a un registry.",
        "The image is the output of the Dockerfile. It can run locally, be tested in CI, and be pushed to a registry."
      ),
      whyItMatters: localized(
        language,
        "Hace que el mismo artefacto pueda moverse entre ambientes con menos sorpresas.",
        "It lets the same artifact move across environments with fewer surprises."
      ),
      example: localized(language, "docker build -t my-app .", "docker build -t my-app ."),
      relatedTerms: ["dockerfile", "deployment"]
    },
    {
      id: "docker-compose",
      term: "Docker Compose",
      category: "containerization",
      shortDefinition: localized(
        language,
        "Archivo para levantar varios servicios locales juntos.",
        "A file for running several local services together."
      ),
      beginnerExplanation: localized(
        language,
        "Si tu app necesita API, web, base de datos o cache, Compose describe como arrancarlos como un entorno local.",
        "If your app needs API, web, database, or cache, Compose describes how to start them as a local environment."
      ),
      whyItMatters: localized(
        language,
        "Reduce setup manual y permite que nuevos contribuidores prueben mas rapido.",
        "It reduces manual setup and helps new contributors test faster."
      ),
      example: localized(language, "docker compose up --build", "docker compose up --build"),
      relatedTerms: ["dockerfile", "environment-variable"]
    },
    {
      id: "ci-pipeline",
      term: "CI pipeline",
      category: "ci_cd",
      shortDefinition: localized(
        language,
        "Automatizacion que valida cambios antes de integrarlos.",
        "Automation that validates changes before they are integrated."
      ),
      beginnerExplanation: localized(
        language,
        "CI significa integracion continua. Cada pull request puede instalar dependencias, correr tests, typecheck y build.",
        "CI means continuous integration. Each pull request can install dependencies, run tests, typecheck, and build."
      ),
      whyItMatters: localized(
        language,
        "Atrapa errores temprano y crea una regla compartida para aceptar cambios.",
        "It catches errors early and creates a shared rule for accepting changes."
      ),
      example: localized(language, ".github/workflows/ci.yml ejecuta pnpm test", ".github/workflows/ci.yml runs pnpm test"),
      relatedTerms: ["quality-gate", "pull-request"]
    },
    {
      id: "quality-gate",
      term: localized(language, "Quality gate", "Quality gate"),
      category: "ci_cd",
      shortDefinition: localized(
        language,
        "Condicion automatica que debe pasar antes de mergear o desplegar.",
        "An automated condition that must pass before merge or deployment."
      ),
      beginnerExplanation: localized(
        language,
        "Un quality gate puede ser 'tests pasan', 'build compila' o 'no hay secretos'. No decide por ti, pero evita saltarse pasos basicos.",
        "A quality gate can be 'tests pass', 'build compiles', or 'no secrets found'. It does not decide for you, but prevents skipping basics."
      ),
      whyItMatters: localized(
        language,
        "Convierte buenas intenciones en controles repetibles.",
        "It turns good intentions into repeatable controls."
      ),
      example: localized(language, "Merge bloqueado si pnpm build falla.", "Merge blocked if pnpm build fails."),
      relatedTerms: ["ci-pipeline", "dependency-scanning"]
    },
    {
      id: "dependency-scanning",
      term: localized(language, "Escaneo de dependencias", "Dependency scanning"),
      category: "security",
      shortDefinition: localized(
        language,
        "Revision automatica de librerias con vulnerabilidades conocidas.",
        "Automated review of libraries with known vulnerabilities."
      ),
      beginnerExplanation: localized(
        language,
        "Tu app depende de paquetes externos. El escaneo avisa cuando una version tiene CVEs o necesita actualizacion.",
        "Your app depends on external packages. Scanning warns when a version has CVEs or needs updating."
      ),
      whyItMatters: localized(
        language,
        "Reduce riesgo sin esperar a una auditoria manual.",
        "It reduces risk without waiting for a manual audit."
      ),
      example: localized(language, "Dependabot crea PRs de actualizacion.", "Dependabot creates update PRs."),
      relatedTerms: ["supply-chain-security", "quality-gate"]
    },
    {
      id: "supply-chain-security",
      term: localized(language, "Seguridad de supply chain", "Supply-chain security"),
      category: "security",
      shortDefinition: localized(
        language,
        "Proteccion del camino por donde llegan dependencias, builds y artefactos.",
        "Protection of the path where dependencies, builds, and artifacts come from."
      ),
      beginnerExplanation: localized(
        language,
        "No solo importa tu codigo. Tambien importan paquetes, acciones de CI, imagenes base y quien puede publicar artefactos.",
        "Your code is not the only thing that matters. Packages, CI actions, base images, and artifact publishers matter too."
      ),
      whyItMatters: localized(
        language,
        "Un ataque puede entrar por una dependencia o pipeline mal controlado.",
        "An attack can enter through a dependency or poorly controlled pipeline."
      ),
      example: localized(language, "Fijar versiones de actions y revisar imagenes base.", "Pin action versions and review base images."),
      relatedTerms: ["dependency-scanning", "secret-hygiene"]
    },
    {
      id: "health-check",
      term: "Health check",
      category: "observability",
      shortDefinition: localized(
        language,
        "Endpoint o comando que responde si el servicio esta vivo.",
        "An endpoint or command that answers whether the service is alive."
      ),
      beginnerExplanation: localized(
        language,
        "Es una senal simple para saber si la app arranco y puede responder. No reemplaza logs ni metricas.",
        "It is a simple signal to know whether the app started and can respond. It does not replace logs or metrics."
      ),
      whyItMatters: localized(
        language,
        "Monitores y despliegues necesitan una forma automatica de verificar el estado.",
        "Monitors and deployments need an automated way to verify state."
      ),
      example: localized(language, "GET /health devuelve { status: 'ok' }", "GET /health returns { status: 'ok' }"),
      relatedTerms: ["structured-logging", "metrics"]
    },
    {
      id: "structured-logging",
      term: localized(language, "Logging estructurado", "Structured logging"),
      category: "observability",
      shortDefinition: localized(
        language,
        "Logs con campos consistentes que una herramienta puede filtrar.",
        "Logs with consistent fields that a tool can filter."
      ),
      beginnerExplanation: localized(
        language,
        "En vez de mensajes sueltos, los logs incluyen datos como nivel, requestId, modulo y error.",
        "Instead of loose messages, logs include data such as level, requestId, module, and error."
      ),
      whyItMatters: localized(
        language,
        "Cuando algo falla, buscar por campos ahorra tiempo y reduce suposiciones.",
        "When something fails, searching by fields saves time and reduces guesswork."
      ),
      example: localized(language, "{ level: 'error', module: 'api', requestId: 'abc' }", "{ level: 'error', module: 'api', requestId: 'abc' }"),
      relatedTerms: ["health-check", "metrics"]
    },
    {
      id: "metrics",
      term: localized(language, "Metricas", "Metrics"),
      category: "observability",
      shortDefinition: localized(
        language,
        "Numeros medibles sobre comportamiento del sistema.",
        "Measurable numbers about system behavior."
      ),
      beginnerExplanation: localized(
        language,
        "Las metricas responden preguntas como cuantos errores hay, cuanto tarda la API o cuanta memoria usa.",
        "Metrics answer questions such as how many errors happen, how long the API takes, or how much memory it uses."
      ),
      whyItMatters: localized(
        language,
        "Permiten detectar tendencias antes de que un usuario reporte el problema.",
        "They help detect trends before a user reports the problem."
      ),
      example: localized(language, "http_request_duration_ms", "http_request_duration_ms"),
      relatedTerms: ["health-check", "structured-logging"]
    },
    {
      id: "runbook",
      term: "Runbook",
      category: "documentation",
      shortDefinition: localized(
        language,
        "Guia operativa para ejecutar o recuperar un proceso.",
        "An operational guide for running or recovering a process."
      ),
      beginnerExplanation: localized(
        language,
        "Un runbook explica que hacer cuando algo comun ocurre: desplegar, revertir, revisar logs o responder a una alerta.",
        "A runbook explains what to do when a common thing happens: deploy, roll back, inspect logs, or respond to an alert."
      ),
      whyItMatters: localized(
        language,
        "Evita improvisar bajo presion y permite que otra persona repita el proceso.",
        "It avoids improvising under pressure and lets another person repeat the process."
      ),
      example: localized(language, "docs/runbooks/rollback.md", "docs/runbooks/rollback.md"),
      relatedTerms: ["rollback", "repository-signal"]
    },
    {
      id: "rollback",
      term: "Rollback",
      category: "ci_cd",
      shortDefinition: localized(
        language,
        "Volver a una version estable anterior.",
        "Return to a previous stable version."
      ),
      beginnerExplanation: localized(
        language,
        "Si una version nueva falla, rollback define como recuperar el servicio sin inventar pasos en caliente.",
        "If a new release fails, rollback defines how to recover service without inventing steps in the moment."
      ),
      whyItMatters: localized(
        language,
        "Reduce el tiempo de recuperacion cuando un despliegue sale mal.",
        "It reduces recovery time when a deployment goes wrong."
      ),
      example: localized(language, "Revertir al tag v1.2.3 y verificar /health.", "Revert to tag v1.2.3 and verify /health."),
      relatedTerms: ["runbook", "health-check"]
    },
    {
      id: "iac",
      term: "Infrastructure as Code",
      category: "infrastructure",
      shortDefinition: localized(
        language,
        "Definir infraestructura con archivos versionados.",
        "Define infrastructure with versioned files."
      ),
      beginnerExplanation: localized(
        language,
        "Servidores, redes o servicios cloud se describen como codigo para revisar cambios antes de aplicarlos.",
        "Servers, networks, or cloud services are described as code so changes can be reviewed before applying them."
      ),
      whyItMatters: localized(
        language,
        "Hace visible que existe en infraestructura y reduce cambios manuales irreproducibles.",
        "It makes infrastructure visible and reduces unreproducible manual changes."
      ),
      example: localized(language, "terraform plan antes de terraform apply", "terraform plan before terraform apply"),
      relatedTerms: ["quality-gate", "kubernetes"]
    },
    {
      id: "kubernetes",
      term: "Kubernetes",
      category: "infrastructure",
      shortDefinition: localized(
        language,
        "Plataforma para ejecutar y orquestar contenedores.",
        "A platform for running and orchestrating containers."
      ),
      beginnerExplanation: localized(
        language,
        "Kubernetes coordina replicas, servicios, configuracion y despliegues. No siempre es necesario al inicio.",
        "Kubernetes coordinates replicas, services, configuration, and deployments. It is not always needed at the beginning."
      ),
      whyItMatters: localized(
        language,
        "Ayuda cuando la aplicacion crece y necesita operacion consistente a mayor escala.",
        "It helps when the app grows and needs consistent operations at larger scale."
      ),
      example: localized(language, "deployment.yaml + service.yaml", "deployment.yaml + service.yaml"),
      relatedTerms: ["container-image", "iac"]
    }
  ];
}
