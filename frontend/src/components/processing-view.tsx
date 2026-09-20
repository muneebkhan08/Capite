"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, Upload, Mic, Film, Download } from "lucide-react";
import { getCaptionJobStatus } from "~/actions/captions";
import type { CaptionJob, CaptionPhase } from "~/types/caption";

interface ProcessingViewProps {
  jobId: string;
  onComplete: (jobId: string) => void;
  onError: (error: string) => void;
}

const PHASES: { id: CaptionPhase; label: string; icon: React.ReactNode }[] = [
  { id: "uploading", label: "Uploading", icon: <Upload className="h-4 w-4" /> },
  { id: "transcribing", label: "Transcribing", icon: <Mic className="h-4 w-4" /> },
  { id: "burning", label: "Burning", icon: <Film className="h-4 w-4" /> },
  { id: "finalizing", label: "Finalizing", icon: <Download className="h-4 w-4" /> },
];

const PHASE_ORDER: CaptionPhase[] = ["uploading", "transcribing", "burning", "finalizing"];

function getPhaseLabel(phase: CaptionPhase | null): string {
  switch (phase) {
    case "uploading":
      return "Uploading Video...";
    case "transcribing":
      return "Transcribing Audio...";
    case "burning":
      return "Burning Captions...";
    case "finalizing":
      return "Finalizing...";
    default:
      return "Processing...";
  }
}

function getPhaseIndex(phase: CaptionPhase | null): number {
  if (!phase) return -1;
  return PHASE_ORDER.indexOf(phase);
}

export function ProcessingView({ jobId, onComplete, onError }: ProcessingViewProps) {
  const [job, setJob] = useState<CaptionJob | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      const result = await getCaptionJobStatus(jobId);
      if (!result) return;
      setJob(result);

      if (result.status === "completed") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete(jobId);
      } else if (result.status === "failed") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onError(result.errorMessage ?? "Processing failed. Please try again.");
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const currentPhase = job?.currentPhase ?? null;
  const progress = job?.progress ?? 0;
  const currentPhaseIndex = getPhaseIndex(currentPhase);

  if (job?.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-brick-200 bg-brick-50 p-10 text-center dark:border-brick-400/30 dark:bg-brick-400/10">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brick-400 text-lg font-bold text-white">
          !
        </span>
        <div>
          <p className="text-[15px] font-semibold text-brick-600 dark:text-brick-200">
            Processing failed
          </p>
          <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-brick-500 dark:text-brick-300">
            {job.errorMessage ?? "Something went wrong. Please try again."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-quiet mt-1 px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Processing stage — a dark workbench so the scan line reads. */}
      <div
        className="bg-grain relative overflow-hidden rounded-2xl border border-oat-900 bg-oat-950"
        style={{ aspectRatio: "16/9" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(#3e8968 1px, transparent 1px), linear-gradient(90deg, #3e8968 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3e8968, transparent 70%)" }}
        />

        {/* Scan line */}
        <div className="animate-scan-line absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-moss-300 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-full border border-oat-900 bg-oat-950/80 py-1.5 pr-3.5 pl-2.5 backdrop-blur-sm">
          <Loader2 className="h-3 w-3 animate-spin text-moss-300" />
          <span className="text-[12px] font-medium text-oat-200">
            {getPhaseLabel(currentPhase)}
          </span>
        </div>

        {/* Big percentage readout */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="numeric text-5xl font-semibold tracking-[-0.04em] text-oat-50/90 sm:text-6xl">
            {progress}
            <span className="ml-0.5 text-2xl text-oat-700">%</span>
          </span>
        </div>
      </div>

      {/* Phase rail — the connecting line fills as stages complete. */}
      <div className="relative">
        <div className="absolute top-[18px] right-[12%] left-[12%] h-px bg-line" />
        <div
          className="absolute top-[18px] left-[12%] h-px bg-brand transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(0, (currentPhaseIndex / (PHASES.length - 1)) * 76)}%`,
          }}
        />

        <div className="relative flex items-start justify-between gap-2">
          {PHASES.map((phase, index) => {
            const isCompleted = currentPhaseIndex > index;
            const isActive = currentPhaseIndex === index;

            return (
              <div
                key={phase.id}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={[
                    "grid h-9 w-9 place-items-center rounded-full border transition-all duration-300",
                    isCompleted
                      ? "border-brand bg-brand text-brand-ink"
                      : isActive
                        ? "border-brand bg-brand-wash text-brand shadow-[0_0_0_4px] shadow-brand/10"
                        : "border-line bg-surface text-ink-faint",
                  ].join(" ")}
                >
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : phase.icon}
                </div>
                <span
                  className={[
                    "text-eyebrow transition-colors",
                    isCompleted || isActive ? "text-ink" : "text-ink-faint",
                  ].join(" ")}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent-lime transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="animate-shimmer absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
        <span className="numeric min-w-[2.75rem] text-right text-[13px] font-semibold text-ink-muted">
          {progress}%
        </span>
      </div>

      <p className="text-center text-xs text-ink-faint">
        Transcription runs locally — larger videos take a little longer. You can
        leave this tab open.
      </p>
    </div>
  );
}
