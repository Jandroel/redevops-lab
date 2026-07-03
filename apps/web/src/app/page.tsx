import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FinalCta } from "@/components/marketing/final-cta";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProblemSection } from "@/components/marketing/problem-section";
import { TechnicalPreview } from "@/components/marketing/technical-preview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeatureGrid />
      <TechnicalPreview />
      <FinalCta />
    </>
  );
}
