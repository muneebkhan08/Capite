"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { CAPTION_STYLE_CONFIGS } from "~/lib/caption-styles";
import { formatDuration } from "~/lib/utils";
import type { CaptionJob } from "~/types/caption";

interface CaptionJobCardProps {
  job: CaptionJob;
}

function getStatusIndicator(status: CaptionJob["status"]) {
  switch (status) {
    case "completed":
      return {
        dot: "bg-moss-500",
        label: "Completed",
        chip: "border-moss-200 bg-moss-100 text-moss-600 dark:border-moss-500/30 dark:bg-moss-500/15 dark:text-moss-300",
        pulse: false,
      };
    case "processing":
    case "uploading":
      return {
        dot: "bg-lemon-400",
        label: "Processing",
        chip: "border-lemon-200 bg-lemon-100 text-lemon-600 dark:border-lemon-400/30 dark:bg-lemon-400/15 dark:text-lemon-300",
        pulse: true,
      };
    case "failed":
      return {
        dot: "bg-brick-400",
        label: "Failed",
        chip: "border-brick-200 bg-brick-100 text-brick-500 dark:border-brick-400/30 dark:bg-brick-400/15 dark:text-brick-200",
        pulse: false,
      };
    default:
      return {
        dot: "bg-oat-500",
        label: "Pending",
        chip: "border-line bg-surface-2 text-ink-subtle",
        pulse: false,
      };
  }
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7)
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CaptionJobCard({ job }: CaptionJobCardProps) {
  const styleConfig = CAPTION_STYLE_CONFIGS[job.captionStyle];
  const status = getStatusIndicator(job.status);

  return (
    <Link
      href={`/captions/${job.id}`}
      className="surface-card-interactive group block overflow-hidden"
    >
      {/* Thumbnail stands in for the video with the chosen style's own
          colours, so the grid is scannable by look, not just by name. */}
      <div
        className="relative overflow-hidden border-b border-line"
        style={{ aspectRatio: "16/9" }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 90% at 30% 10%, ${styleConfig.highlightColor}22, transparent 60%), linear-gradient(140deg, #2d2b27, #171614)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="absolute inset-0 grid place-items-center">
          <Film
            className="h-8 w-8 text-white/20 transition-transform duration-500 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </div>

        {/* A miniature of the caption itself, drawn in the style's palette */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1 px-4">
          <span
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: styleConfig.primaryColor, opacity: 0.75 }}
          />
          <span
            className="h-1.5 w-12 rounded-full"
            style={{ backgroundColor: styleConfig.highlightColor }}
          />
          <span
            className="h-1.5 w-6 rounded-full"
            style={{ backgroundColor: styleConfig.primaryColor, opacity: 0.45 }}
          />
        </div>

        <span
          className={`chip absolute top-3 left-3 backdrop-blur-sm ${status.chip}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {status.pulse && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${status.dot}`}
              />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${status.dot}`}
            />
          </span>
          {status.label}
        </span>
      </div>

      <div className="p-4">
        <p
          className="truncate text-[14px] font-semibold tracking-[-0.015em] text-ink"
          title={job.originalFileName}
        >
          {job.originalFileName}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="chip border-line bg-surface-2 text-ink-muted">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-ink/10"
              style={{
                background: `linear-gradient(135deg, ${styleConfig.primaryColor} 50%, ${styleConfig.highlightColor} 50%)`,
              }}
            />
            {styleConfig.name}
          </span>

          <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
            {job.durationSeconds !== null && (
              <>
                <span className="numeric">
                  {formatDuration(job.durationSeconds)}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-ink-faint/60" />
              </>
            )}
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
