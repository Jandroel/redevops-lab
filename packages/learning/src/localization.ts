import type { DevOpsScoreCategoryKey, ExperienceLevel, ReportLanguage } from "@redevops-lab/shared";

export function localized(language: ReportLanguage, es: string, en: string): string {
  return language === "es" ? es : en;
}

export function levelGuidance(level: ExperienceLevel, language: ReportLanguage): string {
  const messages: Record<ExperienceLevel, { es: string; en: string }> = {
    beginner: {
      es: "Aprende por que esta practica importa y agrega la version minima util.",
      en: "Learn why this practice matters and add the minimum useful version."
    },
    intermediate: {
      es: "Agrega la practica y conectala con el flujo actual del proyecto.",
      en: "Add the practice and connect it to your current workflow."
    },
    advanced: {
      es: "Estandariza la practica para uso de equipo, automatizacion y crecimiento futuro.",
      en: "Standardize the practice and prepare it for team usage, automation and future scaling."
    }
  };

  return messages[level][language];
}

export function noSignal(language: ReportLanguage): string {
  return localized(language, "No se detecto una senal visible.", "No signal detected.");
}

export function noConfigurationFile(language: ReportLanguage): string {
  return localized(
    language,
    "No se detecto un archivo de configuracion visible.",
    "No configuration file was detected."
  );
}

export function categoryLabel(category: DevOpsScoreCategoryKey, language: ReportLanguage): string {
  const labels: Record<DevOpsScoreCategoryKey, { es: string; en: string }> = {
    containerization: { es: "Contenedores", en: "Containerization" },
    ci_cd: { es: "CI/CD", en: "CI/CD" },
    configuration: { es: "Configuracion", en: "Configuration" },
    security: { es: "Seguridad", en: "Security" },
    observability: { es: "Observabilidad", en: "Observability" },
    documentation: { es: "Documentacion", en: "Documentation" },
    infrastructure: { es: "Infraestructura", en: "Infrastructure" }
  };

  return labels[category][language];
}

export function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
