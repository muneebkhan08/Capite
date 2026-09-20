"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileVideo } from "lucide-react";
import { cn, formatBytes, formatDuration } from "~/lib/utils";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPT_ATTR = ".mp4,.mov,.webm";

interface VideoDropzoneProps {
  file: File | null;
  onFileSelect: (file: File, duration: number) => void;
  onFileClear: () => void;
  uploadProgress: number | null;
  disabled?: boolean;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video metadata"));
    };
  });
}

export function VideoDropzone({
  file,
  onFileSelect,
  onFileClear,
  uploadProgress,
  disabled,
}: VideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const validateAndSelect = useCallback(
    async (selected: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(selected.type)) {
        setError("Unsupported format. Please use MP4, MOV, or WebM.");
        return;
      }

      if (selected.size > MAX_FILE_SIZE) {
        setError("File too large. Maximum size is 500 MB.");
        return;
      }

      try {
        const dur = await getVideoDuration(selected);
        setDuration(dur);
        onFileSelect(selected, dur);
      } catch {
        setError("Could not read video duration. Please try another file.");
      }
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        void validateAndSelect(dropped);
      }
    },
    [validateAndSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        void validateAndSelect(selected);
      }
      // Reset input so re-selecting the same file works
      e.target.value = "";
    },
    [validateAndSelect],
  );

  const isUploading = uploadProgress !== null;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={!file && !disabled ? handleClick : undefined}
        onKeyDown={(e) => {
          if (!file && !disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick();
          }
        }}
        onDrop={!file && !disabled ? handleDrop : undefined}
        onDragOver={!file && !disabled ? handleDragOver : undefined}
        onDragLeave={!file && !disabled ? handleDragLeave : undefined}
        className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-200",
          disabled && "pointer-events-none opacity-50",
          !file && !disabled && "cursor-pointer",
          !file &&
            "border border-dashed p-7 " +
              (isDragOver
                ? "border-brand bg-brand-wash scale-[1.01]"
                : "border-line-strong bg-surface-2/50 hover:border-brand/60 hover:bg-brand-wash/40"),
          file && "border border-line bg-surface p-4 shadow-xs",
        )}
      >
        {/* Empty state */}
        {!file && (
          <div className="flex flex-col items-center gap-3.5 text-center">
            <div
              className={cn(
                "grid h-12 w-12 place-items-center rounded-2xl transition-all duration-300",
                isDragOver
                  ? "scale-110 bg-brand text-brand-ink"
                  : "bg-surface text-ink-subtle shadow-xs",
              )}
            >
              <Upload className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[14.5px] font-medium tracking-[-0.01em] text-ink">
                {isDragOver ? "Drop it right here" : "Drop a video, or click to browse"}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                MP4, MOV or WebM &middot; up to 500&nbsp;MB &middot; 30&nbsp;min
              </p>
            </div>
          </div>
        )}

        {/* File selected state */}
        {file && !isUploading && (
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-wash text-brand">
              <FileVideo className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[14px] font-medium tracking-[-0.01em] text-ink"
                title={file.name}
              >
                {file.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="numeric text-[11px] text-ink-faint">
                  {formatBytes(file.size)}
                </span>
                {duration !== null && (
                  <>
                    <span className="h-0.5 w-0.5 rounded-full bg-ink-faint/60" />
                    <span className="numeric text-[11px] text-ink-faint">
                      {formatDuration(duration)}
                    </span>
                  </>
                )}
                <span className="chip ml-1 border-moss-200 bg-moss-100 text-moss-600 dark:border-moss-500/30 dark:bg-moss-500/15 dark:text-moss-300">
                  Ready
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileClear();
                setDuration(null);
                setError(null);
              }}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              disabled={disabled}
              aria-label="Remove video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Uploading state */}
        {file && isUploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-wash text-brand">
                <FileVideo className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">
                  {file.name}
                </p>
                <p className="numeric mt-0.5 text-[11px] text-ink-faint">
                  {formatBytes(file.size)} &middot; uploading
                </p>
              </div>
              <span className="numeric text-[13px] font-semibold text-brand">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
              <div className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-brick-500 dark:text-brick-300">
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brick-400 text-[10px] font-bold text-white">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
