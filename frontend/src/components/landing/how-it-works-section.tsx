"use client";

import { Fragment } from "react";
import { Upload, Palette, Download, Mic, Flame } from "lucide-react";
import { useIntersectionObserver } from "~/hooks/use-intersection-observer";

const steps = [
  {
    number: "1",
    title: "Upload video",
    description:
      "Drop any MP4, MOV or WebM. Up to 500 MB and 30 minutes long.",
    icon: Upload,
    pills: ["MP4, MOV, WebM", "Up to 500 MB", "Up to 30 min"],
  },
  {
    number: "2",
    title: "Pick a style",
    description:
      "Choose from 27 caption styles and preview the motion in real time on an interactive phone mockup.",
    icon: Palette,
    pills: ["27 styles", "Live preview", "Drag to position"],
  },
  {
    number: "3",
    title: "Download",
    description:
      "Your captioned video is ready in full HD, with the original audio untouched.",
    icon: Download,
    pills: ["HD quality", "CRF 18", "Audio preserved"],
  },
];

const pipelineSteps = [
  { icon: Upload, label: "Upload" },
  { icon: Mic, label: "Transcribe" },
  { icon: Palette, label: "Style" },
  { icon: Flame, label: "Burn" },
  { icon: Download, label: "Export" },
];

export function HowItWorksSection() {
  const { ref, isInView } = useIntersectionObserver({ margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="relative bg-canvas py-24">
      <div className="container mx-auto px-6">
        {/* Section heading */}
        <div className={`reveal mx-auto mb-14 max-w-2xl text-center ${isInView ? "in-view" : ""}`}>
          <p className="text-eyebrow mb-4 text-brand">The pipeline</p>
          <h2 className="text-display mb-4 text-[2.5rem] text-ink md:text-5xl">
            Raw video in,{" "}
            <span className="text-editorial text-[1.08em] text-brand">
              captions out
            </span>
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-muted">
            Five stages run on your own machine. Three of them you never have to
            think about.
          </p>
        </div>

        {/* Pipeline slab — warm charcoal so it reads as machinery against
            the paper, with the stages wired together left to right. */}
        <div
          className={`reveal bg-grain relative mx-auto mb-20 max-w-3xl overflow-hidden rounded-2xl bg-oat-950 px-6 py-8 shadow-lg sm:px-10 ${isInView ? "in-view" : ""}`}
          style={{ "--stagger": "0.15s" } as React.CSSProperties}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #3e8968, transparent 70%)" }}
          />
          <div className="relative flex items-start justify-between gap-1 sm:gap-2">
            {pipelineSteps.map((step, i) => (
              <Fragment key={step.label}>
                <div
                  className={`reveal-scale flex shrink-0 flex-col items-center gap-2.5 ${isInView ? "in-view" : ""}`}
                  style={{ "--stagger": `${0.25 + i * 0.12}s` } as React.CSSProperties}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-oat-900 bg-oat-900/80 text-moss-300 sm:h-12 sm:w-12">
                    <step.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <span className="text-eyebrow text-oat-600">{step.label}</span>
                </div>

                {i < pipelineSteps.length - 1 && (
                  <div
                    className={`mt-[22px] h-px flex-1 origin-left bg-gradient-to-r from-moss-500/60 to-moss-500/20 transition-transform duration-500 ${isInView ? "scale-x-100" : "scale-x-0"}`}
                    style={{ transitionDelay: `${0.35 + i * 0.12}s` }}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Steps — three columns joined by a hairline rule, so the
            sequence is legible without a giant zig-zag. */}
        <div className="relative mx-auto max-w-5xl">
          <div
            aria-hidden
            className="rule-fade absolute top-7 right-8 left-8 hidden lg:block"
          />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`reveal relative text-center md:text-left ${isInView ? "in-view" : ""}`}
                style={{ "--stagger": `${0.2 + index * 0.12}s` } as React.CSSProperties}
              >
                <div className="mb-5 flex items-center justify-center gap-3 md:justify-start">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-surface shadow-sm">
                    <span className="text-editorial text-2xl leading-none text-brand">
                      {step.number}
                    </span>
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-wash text-brand">
                    <step.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-semibold tracking-[-0.025em] text-ink">
                  {step.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-ink-muted">
                  {step.description}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-1.5 md:justify-start">
                  {step.pills.map((pill) => (
                    <span
                      key={pill}
                      className="chip border-line bg-surface-2 text-ink-subtle"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
