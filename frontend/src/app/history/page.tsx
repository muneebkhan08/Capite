import Link from "next/link";
import { Film, Plus } from "lucide-react";
import { getCaptionJobs } from "~/actions/captions";
import { CaptionJobCard } from "~/components/caption-job-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Caption history",
};

export default async function HistoryPage() {
  const jobs = await getCaptionJobs();

  return (
    <section className="min-h-screen bg-canvas px-6 pt-28 pb-24">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-eyebrow mb-3 text-brand">Library</p>
            <h1 className="text-display text-[2.25rem] text-ink sm:text-[2.5rem]">
              Caption history
            </h1>
            <p className="mt-2.5 text-[15px] text-ink-muted">
              {jobs.length === 0
                ? "Every video you caption will collect here."
                : `${jobs.length} ${jobs.length === 1 ? "video" : "videos"} captioned on this machine.`}
            </p>
          </div>

          {jobs.length > 0 && (
            <Link
              href="/"
              className="btn-brand inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm"
            >
              <Plus className="h-4 w-4" />
              New caption
            </Link>
          )}
        </div>

        <div className="rule-fade mb-10" />

        {jobs.length === 0 ? (
          /* Empty state */
          <div className="surface-well flex flex-col items-center justify-center gap-5 border-dashed py-24 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface shadow-xs">
              <Film className="h-6 w-6 text-ink-faint" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
                No captions yet
              </p>
              <p className="mt-1.5 text-sm text-ink-faint">
                Upload a video to get started — it takes about a minute.
              </p>
            </div>
            <Link
              href="/"
              className="btn-accent mt-1 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              Upload a video
            </Link>
          </div>
        ) : (
          /* Job grid */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <CaptionJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
