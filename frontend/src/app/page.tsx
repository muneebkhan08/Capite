import { HeroSection } from "~/components/landing/hero-section";
import { FeaturesSection } from "~/components/landing/features-section";
import { HowItWorksSection } from "~/components/landing/how-it-works-section";
import { FAQSection } from "~/components/landing/faq-section";
import { OpenSourceSection } from "~/components/landing/open-source-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <OpenSourceSection />
    </>
  );
}
