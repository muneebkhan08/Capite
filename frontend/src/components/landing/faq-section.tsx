"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useIntersectionObserver } from "~/hooks/use-intersection-observer";

const faqs = [
  {
    question: "What video formats are supported?",
    answer:
      "We support MP4, MOV, and WebM video files. Most videos from phones, cameras, and screen recorders work out of the box.",
  },
  {
    question: "How long does processing take?",
    answer:
      "It depends on video length and your hardware. Roughly 1-3 minutes per minute of video on a modern CPU. Shorter videos process in seconds.",
  },
  {
    question: "What languages are supported?",
    answer:
      "Over 100 languages are supported via automatic detection. The AI transcription identifies the spoken language and selects appropriate fonts for each script.",
  },
  {
    question: "Can I customize caption position?",
    answer:
      "Yes! Use our interactive phone mockup to drag captions anywhere from 5% to 50% from the bottom. Preset buttons for Top, Middle, and Bottom positions.",
  },
  {
    question: "What's the max file size?",
    answer:
      "Default limits are 500MB and 30 minutes, but these are configurable via environment variables when self-hosting. Adjust them to match your server's capabilities.",
  },
  {
    question: "How is this different from other caption tools?",
    answer:
      "It's fully self-hosted and open-source. Your videos stay on your infrastructure. No accounts, no uploads to third parties, no usage limits, and no vendor lock-in.",
  },
];

export function FAQSection() {
  const { ref, isInView } = useIntersectionObserver({ margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      ref={ref}
      className="relative border-y border-line bg-surface-2/50 py-24"
    >
      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className={`reveal mx-auto mb-12 max-w-2xl text-center ${isInView ? "in-view" : ""}`}>
          <p className="text-eyebrow mb-4 text-brand">Questions</p>
          <h2 className="text-display mb-4 text-[2.5rem] text-ink md:text-5xl">
            Frequently asked
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-muted">
            Everything worth knowing before you point it at a video.
          </p>
        </div>

        {/* Single-column disclosure list. Hairline rules instead of six
            floating cards — quieter, and far easier to scan. */}
        <div
          className={`reveal surface-card mx-auto max-w-3xl divide-y divide-line overflow-hidden ${isInView ? "in-view" : ""}`}
          style={{ "--stagger": "0.1s" } as React.CSSProperties}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="group">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 px-5 py-4 text-left transition-colors hover:bg-surface-2/60 sm:px-6 sm:py-5"
                >
                  <span className="flex items-baseline gap-3.5">
                    <span className="text-eyebrow shrink-0 text-ink-faint/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[15px] font-medium tracking-[-0.015em] transition-colors sm:text-base ${
                        isOpen ? "text-ink" : "text-ink-muted group-hover:text-ink"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 border-brand bg-brand text-brand-ink"
                        : "border-line bg-surface-2 text-ink-subtle"
                    }`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pr-14 pb-5 pl-[3.4rem] text-[14.5px] leading-relaxed text-ink-muted sm:pr-16 sm:pb-6 sm:pl-[3.9rem]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
