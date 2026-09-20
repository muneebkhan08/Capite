"use client";

import { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Gauge,
  FastForward,
  Rewind,
  Download,
  Loader2,
} from "lucide-react";
import type {
  TranscriptData,
  CaptionStyleConfig,
  AnimationType,
  TextCasingOption,
  FontWeightOption,
} from "~/types/caption";

interface VideoOverlayPlayerProps {
  videoUrl: string;
  downloadUrl?: string | null;
  downloadFileName?: string;
  onDownload?: () => void;
  isRerendering?: boolean;
  transcript: TranscriptData | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  styleConfig: CaptionStyleConfig;
  animationType: AnimationType;
  customFont: string | null;
  fontWeight: FontWeightOption;
  primaryColor: string | null;
  highlightColor: string | null;
  outlineColor: string | null;
  backgroundColor: string | null;
  captionPosition: number;
  textCasing: TextCasingOption;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLivePreview?: boolean;
  onToggleLivePreview?: (enabled: boolean) => void;
}

function formatDurationDisplay(sec: number): string {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function VideoOverlayPlayer({
  videoUrl,
  downloadUrl,
  downloadFileName,
  onDownload,
  isRerendering,
  transcript,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onTogglePlay,
  onSeek,
  playbackSpeed,
  onChangeSpeed,
  styleConfig,
  animationType,
  customFont,
  fontWeight,
  primaryColor,
  highlightColor,
  outlineColor,
  backgroundColor,
  captionPosition,
  textCasing,
  videoRef,
  isLivePreview: controlledLivePreview,
  onToggleLivePreview,
}: VideoOverlayPlayerProps) {
  // Default to false so completed videos with burned-in captions do not show duplicate HTML captions
  const [internalLiveOverlay, setInternalLiveOverlay] = useState(false);
  const showLiveOverlay =
    controlledLivePreview !== undefined ? controlledLivePreview : internalLiveOverlay;

  const handleToggleLiveOverlay = () => {
    const nextVal = !showLiveOverlay;
    if (onToggleLivePreview) {
      onToggleLivePreview(nextVal);
    } else {
      setInternalLiveOverlay(nextVal);
    }
  };

  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute active segment and active word
  const activeSegment = transcript?.segments?.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end
  );

  const activeWordIndex = activeSegment?.words?.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Toggle fullscreen
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen();
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Skip time
  const handleSkip = (delta: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    videoRef.current.currentTime = newTime;
    onSeek(newTime);
  };

  // Colors & styling
  const effectivePrimary = primaryColor || styleConfig.primaryColor;
  const effectiveHighlight = highlightColor || styleConfig.highlightColor;
  const effectiveOutline = outlineColor || styleConfig.outlineColor;
  const effectiveBg = backgroundColor || styleConfig.backgroundColor || effectiveHighlight;

  const fontFam = customFont || styleConfig.fontName;
  const isBold =
    fontWeight === "bold" || fontWeight === "extra-bold"
      ? true
      : fontWeight === "light" || fontWeight === "regular"
      ? false
      : styleConfig.bold;

  // Casing transformation helper
  const transformWordText = (word: string): string => {
    if (textCasing === "uppercase" || (!textCasing && styleConfig.bold)) {
      return word.toUpperCase();
    }
    if (textCasing === "title") {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (textCasing === "original") {
      return word;
    }
    return word.toUpperCase();
  };

  // Outline shadow string for text
  const strokeColor = effectiveOutline || "#000000";
  const textShadowStyle = `
    -1.5px -1.5px 0 ${strokeColor},
     1.5px -1.5px 0 ${strokeColor},
    -1.5px  1.5px 0 ${strokeColor},
     1.5px  1.5px 0 ${strokeColor},
     0 3px 6px rgba(0,0,0,0.7)
  `;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col overflow-hidden rounded-2xl bg-black shadow-xl"
    >
      {/* Video Container */}
      <div className="relative aspect-video w-full max-h-[65vh] flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          className="h-full w-full object-contain cursor-pointer"
          onClick={onTogglePlay}
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            onDurationChange(e.currentTarget.duration);
            if (videoRef.current) {
              videoRef.current.playbackRate = playbackSpeed;
            }
          }}
          onEnded={() => {
            if (videoRef.current) videoRef.current.currentTime = 0;
          }}
        />

        {/* Live Motion Subtitle Overlay */}
        {showLiveOverlay && activeSegment && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-20 flex justify-center px-6 transition-all duration-150"
            style={{
              bottom: `${captionPosition}%`,
            }}
          >
            <div
              className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-bold tracking-wide max-w-[85%]"
              style={{
                fontFamily: fontFam,
                fontWeight: isBold ? 800 : 500,
                fontSize: "clamp(1.1rem, 2.2vw, 1.8rem)",
                lineHeight: 1.25,
                textShadow: textShadowStyle,
              }}
            >
              {(() => {
                const words = activeSegment.words;
                if (!words || words.length === 0) {
                  return (
                    <span style={{ color: effectivePrimary }}>
                      {transformWordText(activeSegment.text)}
                    </span>
                  );
                }

                // Show only a 4-5 word window around active word to prevent massive text blocks
                const currentIdx =
                  activeWordIndex !== undefined && activeWordIndex >= 0 ? activeWordIndex : 0;
                const windowSize = 5;
                let startIdx = Math.max(0, currentIdx - 2);
                const endIdx = Math.min(words.length, startIdx + windowSize);
                if (endIdx - startIdx < windowSize) {
                  startIdx = Math.max(0, endIdx - windowSize);
                }
                const visibleWordSlice = words.slice(startIdx, endIdx);

                return visibleWordSlice.map((w, sliceIdx) => {
                  const actualIdx = startIdx + sliceIdx;
                  const isActive =
                    actualIdx === activeWordIndex ||
                    (activeWordIndex === -1 && currentTime >= w.start && currentTime <= w.end);

                  let activeMotionClass = "";
                  if (isActive) {
                    if (animationType === "pop") activeMotionClass = "caption-word-active-pop";
                    else if (animationType === "bounce") activeMotionClass = "caption-word-active-bounce";
                    else if (animationType === "scale") activeMotionClass = "caption-word-active-scale";
                    else if (animationType === "glow") activeMotionClass = "caption-word-active-glow";
                    else if (animationType === "box") activeMotionClass = "caption-word-active-box";
                  }

                  const activeColor = isActive ? effectiveHighlight : effectivePrimary;

                  return (
                    <span
                      key={actualIdx}
                      className={`${activeMotionClass} transition-colors duration-100 px-1 rounded`}
                      style={{
                        backgroundColor:
                          isActive && animationType === "box" ? effectiveBg : "transparent",
                        color:
                          isActive && animationType === "box"
                            ? effectivePrimary
                            : activeColor,
                      }}
                    >
                      {transformWordText(w.word)}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Big Play overlay button when paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 z-10 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            title="Play video"
          >
            <Play className="h-7 w-7 fill-white translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-2 border-t border-white/10 bg-gray-950/95 px-4 py-3 text-white backdrop-blur-md">
        {/* Scrub Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">
            {formatDurationDisplay(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.05}
            value={currentTime}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = newTime;
              onSeek(newTime);
            }}
            className="h-1.5 flex-1 cursor-pointer accent-brand"
          />
          <span className="text-xs font-mono text-gray-400">
            {formatDurationDisplay(duration)}
          </span>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={onTogglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            </button>

            {/* Skip -5s */}
            <button
              onClick={() => handleSkip(-5)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Rewind 5 seconds"
            >
              <Rewind className="h-4 w-4" />
            </button>

            {/* Skip +5s */}
            <button
              onClick={() => handleSkip(5)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Skip 5 seconds"
            >
              <FastForward className="h-4 w-4" />
            </button>

            {/* Mute toggle */}
            <button
              onClick={handleToggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-brick-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs">
              <Gauge className="h-3 w-3 text-gray-400" />
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    onChangeSpeed(speed);
                    if (videoRef.current) videoRef.current.playbackRate = speed;
                  }}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    playbackSpeed === speed
                      ? "bg-brand text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Caption Overlay toggle */}
            <button
              onClick={handleToggleLiveOverlay}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                showLiveOverlay
                  ? "bg-brand/20 text-brand border border-brand/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
              title="Toggle real-time animated caption overlay"
            >
              <Sparkles className="h-3 w-3" />
              Live Preview: {showLiveOverlay ? "ON" : "OFF"}
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Download Video */}
            {onDownload ? (
              <button
                type="button"
                onClick={onDownload}
                disabled={isRerendering}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                title={isRerendering ? "Burning Video..." : "Download Video (.mp4)"}
              >
                {isRerendering ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            ) : downloadUrl ? (
              <a
                href={downloadUrl}
                download={downloadFileName || "captioned-video.mp4"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Download video (.mp4)"
              >
                <Download className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
