"use client";

import { Star, GitFork, Check } from "lucide-react";

import { useIntersectionObserver } from "~/hooks/use-intersection-observer";
import { GithubIcon } from "~/components/icons/github";

const REPO = "https://github.com/muneebkhan08/Capite";

const guarantees = ["No accounts", "No telemetry", "No usage limits", "MIT licensed"];

const terminalLines: { prompt: boolean; text: string; muted?: boolean }[] = [
  { prompt: true, text: "git clone https://github.com/muneebkhan08/Capite.git" },
  { prompt: true, text: "cd Capite" },
  { prompt: true, text: "docker compose up" },
  { prompt: false, text: "# → http://localhost:3000", muted: true },
];

export function OpenSourceSection() {
  const { ref, isInView } = useIntersectionObserver({ margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-canvas py-24">
      <div className="container mx-auto px-6">
        <div
          className={`reveal surface-card bg-grain relative mx-auto max-w-5xl overflow-hidden ${isInView ? "in-view" : ""}`}
        >
          {/* Warm bloom anchored to the copy side */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-[0.18] blur-3xl"
            style={{ background: "radial-gradient(circle, #3e8968, transparent 70%)" }}
          />

          <div className="relative grid grid-cols-1 gap-10 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14 lg:p-12">
            {/* Copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-2 py-1.5 pr-4 pl-1.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-oat-950">
                  <GithubIcon className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-[12.5px] font-medium text-ink-muted">
                  Open source, all the way down
                </span>
              </div>

              <h2 className="text-display mb-4 text-[2.25rem] text-ink sm:text-[2.75rem]">
                Yours to run,{" "}
                <span className="text-editorial text-[1.08em] text-brand">
                  fork and break
                </span>
              </h2>

              <p className="mb-6 max-w-[46ch] text-[16px] leading-relaxed text-ink-muted">
                Self-host the whole stack with one Docker Compose command. Your
                videos never touch anyone else&rsquo;s server.
              </p>

              <ul className="mb-8 flex flex-wrap gap-x-5 gap-y-2.5">
                {guarantees.map((g) => (
                  <li
                    key={g}
                    className="flex items-center gap-1.5 text-[13.5px] text-ink-muted"
                  >
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-wash text-brand">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {g}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <Star className="h-4 w-4" />
                  Star on GitHub
                </a>
                <a
                  href={`${REPO}/fork`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-quiet inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <GitFork className="h-4 w-4" />
                  Fork
                </a>
              </div>
            </div>

            {/* Terminal */}
            <div
              className={`reveal w-full overflow-hidden rounded-2xl border border-oat-900 bg-oat-950 text-left shadow-lg lg:w-[23rem] ${isInView ? "in-view" : ""}`}
              style={{ "--stagger": "0.18s" } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 border-b border-oat-900 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-clay-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-lemon-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-moss-400/80" />
                <span className="text-eyebrow ml-2 text-oat-700">terminal</span>
              </div>
              <div className="space-y-1.5 p-4 font-mono text-[12.5px] leading-relaxed">
                {terminalLines.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.muted
                        ? "pt-1.5 text-oat-700"
                        : line.prompt
                          ? "text-oat-300"
                          : "pl-3 text-oat-300"
                    }
                  >
                    {line.prompt && (
                      <span className="mr-1.5 text-moss-400 select-none">$</span>
                    )}
                    <span className="break-all">{line.text}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
