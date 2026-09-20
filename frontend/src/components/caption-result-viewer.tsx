"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Trash2,
  Loader2,
  Sparkles,
  FileText,
  Palette,
  Check,
  RefreshCw,
  Video,
  Info,
  ChevronDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import {
  deleteCaptionJob,
  getCaptionJobTranscript,
  rerenderCaptionJob,
  getCaptionJobStatus,
} from "~/actions/captions";
import { CAPTION_STYLE_CONFIGS } from "~/lib/caption-styles";
import { clientEnv } from "~/lib/env";
import { formatDuration, formatBytes } from "~/lib/utils";
import type {
  CaptionJob,
  CaptionStyle,
  AnimationType,
  FontWeightOption,
  FontStyleOption,
  TextCasingOption,
  TranscriptData,
} from "~/types/caption";
import { TranscriptEditor } from "./studio/transcript-editor";
import { StyleMotionEditor } from "./studio/style-motion-editor";
import { VideoOverlayPlayer } from "./studio/video-overlay-player";
import {
  transcriptToSrt,
  transcriptToVtt,
  transcriptToTxt,
  downloadBlob,
} from "~/lib/subtitle-export";

interface CaptionResultViewerProps {
  job: CaptionJob;
}

export function CaptionResultViewer({ job }: CaptionResultViewerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Studio tabs
  const [activeTab, setActiveTab] = useState<"transcript" | "style">("transcript");

  // Transcript state
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Style customization state
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>(job.captionStyle);
  const [animationType, setAnimationType] = useState<AnimationType>(
    CAPTION_STYLE_CONFIGS[job.captionStyle]?.animationType || "pop"
  );
  const [customFont, setCustomFont] = useState<string | null>(job.customFont || null);
  const [fontWeight, setFontWeight] = useState<FontWeightOption>(
    (job.fontWeight as FontWeightOption) || "default"
  );
  const [fontStyle, setFontStyle] = useState<FontStyleOption>(
    (job.fontStyle as FontStyleOption) || "default"
  );
  const [textCasing, setTextCasing] = useState<TextCasingOption>(
    (job.textCasing as TextCasingOption) || "default"
  );
  const [primaryColor, setPrimaryColor] = useState<string | null>(job.primaryColor || null);
  const [highlightColor, setHighlightColor] = useState<string | null>(job.highlightColor || null);
  const [outlineColor, setOutlineColor] = useState<string | null>(job.outlineColor || null);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(job.backgroundColor || null);
  const [captionPosition, setCaptionPosition] = useState<number>(job.captionPosition || 10);

  // Video playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(job.durationSeconds || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [videoVersion, setVideoVersion] = useState<number>(0);

  // Re-render state
  const [isRerendering, setIsRerendering] = useState(false);
  const [rerenderSuccess, setRerenderSuccess] = useState(false);
  const [rerenderError, setRerenderError] = useState<string | null>(null);

  // Details sidebar drawer toggle on mobile / collapsed
  const [showMetadata, setShowMetadata] = useState(false);

  // Live preview mode state (false by default so rendered video displays cleanly without HTML overlay)
  const [isLivePreview, setIsLivePreview] = useState(false);

  const backendBaseUrl = clientEnv.NEXT_PUBLIC_BACKEND_URL;
  const currentStyleConfig = CAPTION_STYLE_CONFIGS[selectedStyle] || CAPTION_STYLE_CONFIGS.hormozi;

  // File download name
  const downloadFileName = `captioned-${job.originalFileName || "video.mp4"}`;

  // Video streaming URL for HTML5 player with cache busting.
  // When Live Preview is enabled, stream the uncaptioned original video so live HTML captions
  // don't duplicate on top of burned-in video subtitles. Otherwise, stream the final captioned video.
  const videoUrl = job.backendJobId
    ? `${backendBaseUrl}/api/video/${job.backendJobId}?type=${isLivePreview ? "original" : "captioned"}&v=${videoVersion}`
    : "";

  // Direct download URL for downloading the MP4 file
  const downloadUrl = job.backendJobId
    ? `${backendBaseUrl}/api/download/${job.backendJobId}`
    : null;

  // Fetch initial transcript
  useEffect(() => {
    let isMounted = true;
    async function loadTranscript() {
      setIsLoadingTranscript(true);
      const data = await getCaptionJobTranscript(job.id);
      if (isMounted) {
        if (data && data.segments) {
          setTranscript(data);
        } else {
          // Fallback initial empty structure
          setTranscript({
            language: job.language || "en",
            segments: [],
          });
        }
        setIsLoadingTranscript(false);
      }
    }
    void loadTranscript();
    return () => {
      isMounted = false;
    };
  }, [job.id, job.language]);

  // Compute active segment index
  const activeSegmentIndex = transcript?.segments
    ? transcript.segments.findIndex(
        (seg) => currentTime >= seg.start && currentTime <= seg.end
      )
    : -1;

  // Video play/pause toggle
  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Keyboard shortcut: Spacebar to play/pause when not in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        )
      ) {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlay]);

  // Seek video
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Style change
  const handleSelectStyle = (newStyle: CaptionStyle) => {
    setSelectedStyle(newStyle);
    const newConfig = CAPTION_STYLE_CONFIGS[newStyle];
    if (newConfig) {
      setAnimationType(newConfig.animationType);
      setPrimaryColor(null);
      setHighlightColor(null);
      setOutlineColor(null);
      setBackgroundColor(null);
    }
    setHasUnsavedChanges(true);
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    const origConfig = CAPTION_STYLE_CONFIGS[selectedStyle];
    if (origConfig) {
      setAnimationType(origConfig.animationType);
      setCustomFont(null);
      setFontWeight("default");
      setFontStyle("default");
      setTextCasing("default");
      setPrimaryColor(null);
      setHighlightColor(null);
      setOutlineColor(null);
      setBackgroundColor(null);
      setCaptionPosition(job.captionPosition || 10);
    }
  };

  // Re-render and burn subtitles into MP4
  const handleRerender = async (): Promise<boolean> => {
    if (!transcript) return false;
    setIsRerendering(true);
    setRerenderError(null);
    setRerenderSuccess(false);

    try {
      const res = await rerenderCaptionJob(job.id, {
        transcript,
        captionStyle: selectedStyle,
        captionPosition,
        customFont,
        fontWeight,
        fontStyle,
        textCasing,
        primaryColor,
        highlightColor,
        outlineColor,
        backgroundColor,
      });

      if (!res.success) {
        setRerenderError(res.error || "Re-render failed");
        setIsRerendering(false);
        return false;
      }

      // Poll until backend completes re-render
      return await new Promise<boolean>((resolve) => {
        let attempts = 0;
        const maxAttempts = 120; // 2 minutes max
        const interval = setInterval(async () => {
          attempts++;
          const status = await getCaptionJobStatus(job.id, true);
          if (status && status.status === "completed") {
            clearInterval(interval);
            setIsRerendering(false);
            setHasUnsavedChanges(false);
            setRerenderSuccess(true);
            setIsLivePreview(false);
            setVideoVersion(Date.now());
            setTimeout(() => setRerenderSuccess(false), 5000);
            resolve(true);
          } else if (status && status.status === "failed") {
            clearInterval(interval);
            setIsRerendering(false);
            setRerenderError(status.errorMessage || "Re-render failed");
            resolve(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            setIsRerendering(false);
            setRerenderError("Re-render timed out. Please try again.");
            resolve(false);
          }
        }, 1000);
      });
    } catch (err) {
      setIsRerendering(false);
      setRerenderError(err instanceof Error ? err.message : "Re-render failed");
      return false;
    }
  };

  // Download Video: automatically burns edits if unsaved changes exist
  const handleDownloadVideo = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!job.backendJobId) return;

    if (hasUnsavedChanges) {
      const success = await handleRerender();
      if (!success) return;
    }

    // Direct browser download with cache buster
    const targetUrl = `${backendBaseUrl}/api/download/${job.backendJobId}?v=${Date.now()}`;
    const a = document.createElement("a");
    a.href = targetUrl;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export Subtitles (SRT, VTT, TXT) immediately from current script state
  const handleExportSubtitle = (format: "srt" | "vtt" | "txt") => {
    if (!transcript) return;
    const baseName = job.originalFileName?.replace(/\.[^/.]+$/, "") || "subtitles";

    if (format === "srt") {
      const srt = transcriptToSrt(transcript);
      downloadBlob(srt, `${baseName}.srt`, "text/plain");
    } else if (format === "vtt") {
      const vtt = transcriptToVtt(transcript);
      downloadBlob(vtt, `${baseName}.vtt`, "text/vtt");
    } else if (format === "txt") {
      const txt = transcriptToTxt(transcript);
      downloadBlob(txt, `${baseName}.txt`, "text/plain");
    }
  };

  // Delete Job
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCaptionJob(job.id);
      router.push("/history");
    } catch {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (job.status === "processing" || job.status === "uploading") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 dark:bg-gray-950"
      >
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-base font-medium text-ink-muted">
          Generating subtitles & timestamps...
        </p>
        <Link
          href="/"
          className="text-sm text-brand underline-offset-4 hover:underline"
        >
          Go back home
        </Link>
      </div>
    );
  }

  // Failed state
  if (job.status === "failed") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 dark:bg-gray-950"
      >
        <div className="rounded-xl border border-brick-200 dark:border-brick-400/30 bg-brick-50 dark:bg-brick-400/10 px-6 py-8 text-center">
          <p className="mb-2 text-base font-semibold text-brick-400">Processing failed</p>
          <p className="text-sm text-brick-300">
            {job.errorMessage ?? "An unknown error occurred."}
          </p>
        </div>
        <Link
          href="/history"
          className="text-sm text-brand underline-offset-4 hover:underline"
        >
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 truncate">
            <Link
              href="/history"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900  dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              History
            </Link>

            <div className="h-4 w-px bg-surface-3" />

            <div className="min-w-0 truncate">
              <p className="text-eyebrow mb-0.5 text-ink-faint">Editing</p>
              <h1
                className="truncate text-[13px] font-semibold tracking-[-0.015em] text-ink"
                title={job.originalFileName}
              >
                {job.originalFileName}
              </h1>
            </div>
          </div>

          {/* Right: Re-render, Export & Actions */}
          <div className="flex items-center gap-2">
            {/* Re-render Button */}
            <button
              onClick={() => void handleRerender()}
              disabled={isRerendering}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                hasUnsavedChanges
                  ? "bg-brand text-white hover:bg-brand-hover shadow-sm animate-pulse"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
              title="Burn edited words and updated styles into the final video"
            >
              {isRerendering ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {isRerendering ? "Burning Video..." : "Apply & Re-render"}
            </button>

            {/* Direct Download Video Button */}
            <button
              type="button"
              onClick={(e) => void handleDownloadVideo(e)}
              disabled={isRerendering}
              className="btn-brand flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs"
              title={
                hasUnsavedChanges
                  ? "Burns your edited script into the video and downloads the fresh MP4"
                  : "Download final captioned video (.mp4)"
              }
            >
              {isRerendering ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>
                {isRerendering
                  ? "Burning..."
                  : hasUnsavedChanges
                  ? "Save & Download"
                  : "Download Video"}
              </span>
            </button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Export
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuItem
                  onClick={(e) => void handleDownloadVideo(e)}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-surface-2"
                >
                  <Video className="h-4 w-4 text-brand" />
                  <div>
                    <p className="font-semibold">Burned Video (.mp4)</p>
                    <p className="text-[10px] text-ink-faint">
                      {hasUnsavedChanges ? "Burns your latest edits" : "Hardcoded motion subtitles"}
                    </p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleExportSubtitle("srt")}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-surface-2"
                >
                  <FileText className="h-4 w-4 text-sky-400" />
                  <div>
                    <p className="font-semibold">SubRip Subtitles (.srt)</p>
                    <p className="text-[10px] text-ink-faint">Instant export with latest edits</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleExportSubtitle("vtt")}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-surface-2"
                >
                  <FileText className="h-4 w-4 text-iris-400" />
                  <div>
                    <p className="font-semibold">WebVTT Subtitles (.vtt)</p>
                    <p className="text-[10px] text-ink-faint">Web player captions with edits</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleExportSubtitle("txt")}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-surface-2"
                >
                  <FileText className="h-4 w-4 text-ink-faint" />
                  <div>
                    <p className="font-semibold">Plain Text Script (.txt)</p>
                    <p className="text-[10px] text-ink-faint">Raw transcript with latest edits</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    window.open(
                      `${backendBaseUrl}/api/export/${job.backendJobId}?format=ass&v=${videoVersion}`,
                      "_blank"
                    );
                  }}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-surface-2"
                >
                  <Sparkles className="h-4 w-4 text-highlight" />
                  <div>
                    <p className="font-semibold">SubStation Alpha (.ass)</p>
                    <p className="text-[10px] text-ink-faint">Full styles & animation tags</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


            {/* Info toggle */}
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Job details & metadata"
            >
              <Info className="h-4 w-4" />
            </button>

            {/* Delete modal */}
            <AlertDialog>
              <AlertDialogTrigger
                disabled={isDeleting}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-brick-50 hover:text-brick-500 dark:hover:bg-brick-400/15 dark:hover:text-brick-200"
                title="Delete this caption job"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this caption job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the video, transcript, and processed files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleDelete()}
                    className="bg-brick-400 hover:bg-brick-500"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Notifications / Banners */}
        {rerenderSuccess && (
          <div className="flex items-center justify-between bg-moss-500/15 px-4 py-1.5 text-xs font-semibold text-moss-600 dark:text-moss-400">
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" />
              <span>Captions successfully re-burned! Video updated.</span>
            </div>
            {downloadUrl && (
              <button
                type="button"
                onClick={(e) => void handleDownloadVideo(e)}
                className="flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80"
              >
                <Download className="h-3 w-3" />
                Download Video
              </button>
            )}
          </div>
        )}

        {rerenderError && (
          <div className="flex items-center justify-center gap-2 border-t border-brick-200 bg-brick-50 px-4 py-2 text-xs font-medium text-brick-600 dark:border-brick-400/25 dark:bg-brick-400/10 dark:text-brick-200">
            {rerenderError}
          </div>
        )}

        {hasUnsavedChanges && !rerenderSuccess && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lemon-200 bg-lemon-50 px-4 py-2 text-xs text-lemon-600 dark:border-lemon-400/25 dark:bg-lemon-400/10 dark:text-lemon-200">
            <span>
              You have unsaved changes in your script or motion style. Preview is live in the video player.
            </span>
            <button
              onClick={() => void handleRerender()}
              disabled={isRerendering}
              className="font-bold underline underline-offset-2 hover:opacity-80"
            >
              Click here to Re-render
            </button>
          </div>
        )}
      </header>

      {/* Main Studio Workspace */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Video Player & Overlay (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <VideoOverlayPlayer
              videoUrl={videoUrl}
              downloadUrl={downloadUrl}
              downloadFileName={downloadFileName}
              onDownload={() => void handleDownloadVideo()}
              isRerendering={isRerendering}
              isLivePreview={isLivePreview}
              onToggleLivePreview={(enabled) => setIsLivePreview(enabled)}
              transcript={transcript}
              currentTime={currentTime}
              duration={videoDuration}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onDurationChange={(d) => setVideoDuration(d)}
              onTogglePlay={handleTogglePlay}
              onSeek={handleSeek}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={(s) => setPlaybackSpeed(s)}
              styleConfig={currentStyleConfig}
              animationType={animationType}
              customFont={customFont}
              fontWeight={fontWeight}
              primaryColor={primaryColor}
              highlightColor={highlightColor}
              outlineColor={outlineColor}
              backgroundColor={backgroundColor}
              captionPosition={captionPosition}
              textCasing={textCasing}
              videoRef={videoRef}
            />

            {/* Final Rendered Video Download & Export Card */}
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-wash text-brand">
                  <Video className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-ink">
                    Final Captioned Video
                  </h3>
                  <p className="truncate text-xs text-ink-subtle">
                    {hasUnsavedChanges ? (
                      <span className="font-semibold text-lemon-600 dark:text-lemon-300">
                        Unsaved script edits &bull; Click to burn & download fresh MP4
                      </span>
                    ) : (
                      `Hardcoded motion subtitles • ${currentStyleConfig?.name || job.captionStyle} style`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => void handleDownloadVideo(e)}
                  disabled={isRerendering}
                  className="btn-brand flex items-center gap-2 px-4 py-2.5 text-xs"
                  title="Download final captioned video (.mp4)"
                >
                  {isRerendering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isRerendering
                    ? "Burning Video..."
                    : hasUnsavedChanges
                    ? "Save Edits & Download Video (.mp4)"
                    : "Download Video (.mp4)"}
                </button>

                <span className="flex items-center gap-0.5 rounded-xl border border-line bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => handleExportSubtitle("srt")}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                  title="Download SRT Subtitles (includes latest edits)"
                >
                  <FileText className="h-3.5 w-3.5 text-sky-400" />
                  SRT
                </button>

                <button
                  type="button"
                  onClick={() => handleExportSubtitle("vtt")}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                  title="Download WebVTT Subtitles (includes latest edits)"
                >
                  <FileText className="h-3.5 w-3.5 text-iris-400" />
                  VTT
                </button>

                <button
                  type="button"
                  onClick={() => handleExportSubtitle("txt")}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                  title="Download Plain Text Script (includes latest edits)"
                >
                  <FileText className="h-3.5 w-3.5 text-ink-faint" />
                  TXT
                </button>
                </span>
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="surface-card flex flex-wrap items-center justify-between gap-2 p-3 text-xs text-ink-subtle">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <span>
                  <strong>Tip:</strong> Click any word in the script on the right to edit its spelling or punctuation.
                </span>
              </div>
              <span className="chip border-line bg-surface-2 text-ink-faint">Space = play / pause</span>
            </div>

            {/* Metadata Drawer (if toggled) */}
            {showMetadata && (
              <div className="surface-card p-4 shadow-sm">
                <h3 className="text-eyebrow mb-3.5 text-ink-faint">
                  Job telemetry
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-ink-faint">Duration</span>
                    <p className="font-semibold text-ink">
                      {formatDuration(job.durationSeconds || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-ink-faint">Language</span>
                    <p className="font-semibold text-ink uppercase">
                      {job.language || "en"}
                    </p>
                  </div>
                  <div>
                    <span className="text-ink-faint">File Size</span>
                    <p className="font-semibold text-ink">
                      {formatBytes(job.fileSize)}
                    </p>
                  </div>
                  <div>
                    <span className="text-ink-faint">Initial Render</span>
                    <p className="font-semibold text-ink">
                      {job.processingTimeMs ? `${(job.processingTimeMs / 1000).toFixed(1)}s` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Studio Editor (5 cols) */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-5">
            {/* Tab Selector */}
            <div className="flex border-b border-gray-200 bg-gray-50/50 p-1 dark:border-gray-800 dark:bg-gray-950/50">
              <button
                onClick={() => setActiveTab("transcript")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                  activeTab === "transcript"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-brand" />
                Script & Words
              </button>

              <button
                onClick={() => setActiveTab("style")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                  activeTab === "style"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Palette className="h-3.5 w-3.5 text-highlight" />
                Motion & Style
              </button>
            </div>

            {/* Tab Body */}
            <div>
              {activeTab === "transcript" && (
                isLoadingTranscript ? (
                  <div className="flex h-80 flex-col items-center justify-center gap-3 p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                    <p className="text-xs text-gray-500">Loading transcript words...</p>
                  </div>
                ) : transcript ? (
                  <TranscriptEditor
                    transcript={transcript}
                    currentTime={currentTime}
                    activeSegmentIndex={activeSegmentIndex}
                    onSeek={handleSeek}
                    onChangeTranscript={(newTranscript) => {
                      setTranscript(newTranscript);
                      setHasUnsavedChanges(true);
                    }}
                    autoScroll={autoScroll}
                    onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
                  />
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400">
                    Failed to load transcript.
                  </div>
                )
              )}

              {activeTab === "style" && (
                <StyleMotionEditor
                  selectedStyle={selectedStyle}
                  onSelectStyle={handleSelectStyle}
                  animationType={animationType}
                  onChangeAnimationType={(anim) => {
                    setAnimationType(anim);
                    setHasUnsavedChanges(true);
                  }}
                  customFont={customFont}
                  onChangeFont={(f) => {
                    setCustomFont(f);
                    setHasUnsavedChanges(true);
                  }}
                  fontWeight={fontWeight}
                  onChangeFontWeight={(w) => {
                    setFontWeight(w);
                    setHasUnsavedChanges(true);
                  }}
                  fontStyle={fontStyle}
                  onChangeFontStyle={(s) => {
                    setFontStyle(s);
                    setHasUnsavedChanges(true);
                  }}
                  textCasing={textCasing}
                  onChangeTextCasing={(c) => {
                    setTextCasing(c);
                    setHasUnsavedChanges(true);
                  }}
                  primaryColor={primaryColor}
                  onChangePrimaryColor={(c) => {
                    setPrimaryColor(c);
                    setHasUnsavedChanges(true);
                  }}
                  highlightColor={highlightColor}
                  onChangeHighlightColor={(c) => {
                    setHighlightColor(c);
                    setHasUnsavedChanges(true);
                  }}
                  outlineColor={outlineColor}
                  onChangeOutlineColor={(c) => {
                    setOutlineColor(c);
                    setHasUnsavedChanges(true);
                  }}
                  backgroundColor={backgroundColor}
                  onChangeBackgroundColor={(c) => {
                    setBackgroundColor(c);
                    setHasUnsavedChanges(true);
                  }}
                  captionPosition={captionPosition}
                  onChangeCaptionPosition={(pos) => {
                    setCaptionPosition(pos);
                    setHasUnsavedChanges(true);
                  }}
                  onResetDefaults={handleResetDefaults}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Re-rendering Modal Overlay */}
      {isRerendering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                Burning Captions into Video
              </h3>
              <p className="mt-1.5 text-xs text-ink-subtle">
                Encoding your edited words and motion subtitles into a fresh MP4. Your download will start automatically once finished...
              </p>
            </div>
            <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand h-full w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
