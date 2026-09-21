import { HeroSection } from "~/components/landing/hero-section";
import { FeaturesSection } from "~/components/landing/features-section";
import { HowItWorksSection } from "~/components/landing/how-it-works-section";
import { FAQSection } from "~/components/landing/faq-section";
import { OpenSourceSection } from "~/components/landing/open-source-section";
import { publicSiteUrl, repositoryUrl } from "~/lib/site";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Capite",
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "AI video caption generator",
    operatingSystem: "Docker, macOS, Linux, Windows",
    isAccessibleForFree: true,
    license: `${repositoryUrl}/blob/main/LICENSE`,
    codeRepository: repositoryUrl,
    downloadUrl: repositoryUrl,
    url: publicSiteUrl?.toString() ?? repositoryUrl,
    description:
      "Free, open-source AI video caption generator for editable, word-timed animated subtitles. Self-host it with Docker and process video locally using faster-whisper and FFmpeg.",
    featureList: [
      "Local faster-whisper transcription with word-level timestamps",
      "27 animated caption styles",
      "Editable transcript and in-place re-rendering",
      "MP4, SRT, VTT, TXT, and ASS export",
      "Self-hosted, MIT-licensed source code",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Capite supports MP4, MOV, and WebM video files.",
        },
      },
      {
        "@type": "Question",
        name: "What languages are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Capite supports automatic speech recognition for more than 100 languages through faster-whisper.",
        },
      },
      {
        "@type": "Question",
        name: "How is Capite different from other caption tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Capite is self-hosted and open source. It processes videos on your own infrastructure and provides local transcription, editable word-level timing, animated caption styles, and standard subtitle exports.",
        },
      },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <OpenSourceSection />
    </>
  );
}
