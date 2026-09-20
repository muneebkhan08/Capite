"use client";

import { Mic, Palette, Sparkles, Globe, Shield, Download } from "lucide-react";
import { useIntersectionObserver } from "~/hooks/use-intersection-observer";

/* Each card gets its own tint from the accent family. Six hues, all
   desaturated to the same perceived weight, so the grid reads as one
   set rather than six competing chips. */
const features = [
  {
    icon: Mic,
    title: "AI transcription",
    description:
      "Powered by faster-whisper. Automatic speech-to-text with word-level timestamps for precise caption timing.",
    tint: "bg-moss-100 text-moss-600 dark:bg-moss-500/15 dark:text-moss-300",
    edge: "group-hover:border-moss-300 dark:group-hover:border-moss-500/40",
  },
  {
    icon: Palette,
    title: "27 motion styles",
    description:
      "Kapwing Viral, Neon Cyber, Retro Glitch, Cinema Gold, TikTok Hype, Hormozi, MrBeast, Crimson Pop and more — each with its own animation.",
    tint: "bg-iris-100 text-iris-500 dark:bg-iris-400/15 dark:text-iris-300",
    edge: "group-hover:border-iris-200 dark:group-hover:border-iris-400/40",
  },
  {
    icon: Sparkles,
    title: "Word-level script editor",
    description:
      "Click any word in the transcript to fix a mis-heard name or typo. Real-time video sync, find & replace, one-click re-render.",
    tint: "bg-lemon-100 text-lemon-600 dark:bg-lemon-400/15 dark:text-lemon-300",
    edge: "group-hover:border-lemon-200 dark:group-hover:border-lemon-400/40",
  },
  {
    icon: Globe,
    title: "Multi-language & export",
    description:
      "Detects 100+ languages automatically. Export standalone SRT, WebVTT, plain text, ASS — or a burned-in MP4.",
    tint: "bg-sky-100 text-sky-500 dark:bg-sky-400/15 dark:text-sky-300",
    edge: "group-hover:border-sky-200 dark:group-hover:border-sky-400/40",
  },
  {
    icon: Shield,
    title: "Self-hosted & private",
    description:
      "Runs on your own infrastructure with Docker. No accounts, no tracking, no data collection — the video never leaves your machine.",
    tint: "bg-clay-100 text-clay-500 dark:bg-clay-400/15 dark:text-clay-300",
    edge: "group-hover:border-clay-200 dark:group-hover:border-clay-400/40",
  },
  {
    icon: Download,
    title: "HD export & re-render",
    description:
      "Full-quality download at CRF 18 with the original audio stream preserved, plus a one-click re-burn after transcript edits.",
    tint: "bg-lime-100 text-lime-600 dark:bg-lime-300/15 dark:text-lime-300",
    edge: "group-hover:border-lime-200 dark:group-hover:border-lime-300/40",
  },
];

export function FeaturesSection() {
  const { ref, isInView } = useIntersectionObserver({ margin: "-100px" });

  return (
    <section
      id="features"
      ref={ref}
      className="relative border-y border-line bg-surface-2/50 py-24"
    >
      <div className="container mx-auto px-6">
        <div className={`reveal mx-auto mb-14 max-w-2xl text-center ${isInView ? "in-view" : ""}`}>
          <p className="text-eyebrow mb-4 text-brand">Capabilities</p>
          <h2 className="text-display mb-4 text-[2.5rem] text-ink md:text-5xl">
            Everything you need,{" "}
            <span className="text-editorial text-[1.08em] text-brand">
              nothing you don&rsquo;t
            </span>
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-muted">
            A complete toolkit for adding animated captions to any video — from
            raw upload to publish-ready export.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`surface-card-interactive reveal group relative overflow-hidden p-6 ${feature.edge} ${isInView ? "in-view" : ""}`}
              style={{ "--stagger": `${index * 0.07}s` } as React.CSSProperties}
            >
              {/* Index marker — imagine.art numbers its tiles; it gives
                  the eye an anchor and makes the grid feel catalogued. */}
              <span className="text-eyebrow absolute top-5 right-5 text-ink-faint/50 transition-colors group-hover:text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div
                className={`mb-5 inline-flex rounded-xl p-2.5 transition-transform duration-300 group-hover:-rotate-6 ${feature.tint}`}
              >
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.02em] text-ink">
                {feature.title}
              </h3>
              <p className="text-[14.5px] leading-relaxed text-ink-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
