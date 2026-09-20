"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Video, Moon, Sun, Grid3X3 } from "lucide-react";
import { cn } from "~/lib/utils";
import { CAPTION_POSITION_MIN, CAPTION_POSITION_MAX } from "~/lib/caption-styles";
import type {
  CaptionStyleConfig,
  FontWeightOption,
  WeightTransitionOption,
  FontStyleOption,
  TextCasingOption,
} from "~/types/caption";

interface CaptionPreviewProps {
  style: CaptionStyleConfig;
  position: number;
  onPositionChange: (position: number) => void;
  customFont?: string | null;
  fontWeight?: FontWeightOption | null;
  weightTransition?: WeightTransitionOption | null;
  fontStyle?: FontStyleOption | null;
  textCasing?: TextCasingOption | null;
  customPrimaryColor?: string | null;
  customHighlightColor?: string | null;
  customOutlineColor?: string | null;
  customBackgroundColor?: string | null;
}

const POSITION_PRESETS = [
  { label: "Top", value: 45 },
  { label: "Middle", value: 30 },
  { label: "Bottom", value: 10 },
] as const;

type BackdropScene = "cinematic" | "dark" | "light" | "grid";

const BACKDROP_SCENES = [
  { id: "cinematic" as const, label: "Cinematic", icon: Video },
  { id: "dark" as const, label: "Dark Glass", icon: Moon },
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "grid" as const, label: "Grid", icon: Grid3X3 },
];

/**
 * Builds an 8-direction continuous circular text-shadow stroke that
 * matches libass font stroke rendering pixel-for-pixel.
 */
function buildLibassTextShadow(
  outlineColor: string,
  outlineSize: number,
  shadowDepth: number,
  isGlow?: boolean,
  glowColor?: string,
): string {
  if (!outlineColor || outlineColor.toLowerCase() === "none" || outlineSize <= 0) {
    return shadowDepth > 0 ? `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0,0,0,0.5)` : "none";
  }

  const r = outlineSize;
  const diag = +(r * 0.7071).toFixed(2);
  const shadows = [
    `${r}px 0 0 ${outlineColor}`,
    `-${r}px 0 0 ${outlineColor}`,
    `0 ${r}px 0 ${outlineColor}`,
    `0 -${r}px 0 ${outlineColor}`,
    `${diag}px ${diag}px 0 ${outlineColor}`,
    `-${diag}px ${diag}px 0 ${outlineColor}`,
    `${diag}px -${diag}px 0 ${outlineColor}`,
    `-${diag}px -${diag}px 0 ${outlineColor}`,
    `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0,0,0,0.6)`,
  ];

  if (isGlow && glowColor && glowColor.toLowerCase() !== "none") {
    shadows.push(`0 0 ${Math.max(shadowDepth * 2, 8)}px ${glowColor}`);
    shadows.push(`0 0 ${Math.max(shadowDepth * 4, 16)}px ${glowColor}`);
  }

  return shadows.join(", ");
}

export function CaptionPreview({
  style,
  position,
  onPositionChange,
  customFont,
  fontWeight,
  weightTransition = "none",
  fontStyle,
  textCasing,
  customPrimaryColor,
  customHighlightColor,
  customOutlineColor,
  customBackgroundColor,
}: CaptionPreviewProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [activeBackdrop, setActiveBackdrop] = useState<BackdropScene>("cinematic");

  const activePrimaryColor = customPrimaryColor || style.primaryColor;
  const activeHighlightColor = customHighlightColor || style.highlightColor;
  const activeOutlineColor =
    customOutlineColor !== undefined && customOutlineColor !== null
      ? customOutlineColor
      : style.outlineColor;

  const isBoxStyle = style.animationType === "box" || style.id === "crimson-pop";
  const activeBackgroundColor =
    customBackgroundColor !== undefined && customBackgroundColor !== null
      ? customBackgroundColor
      : isBoxStyle
        ? style.highlightColor
        : "none";

  const resolvedFontName = customFont || style.fontName;

  const resolvedFontStyle = (() => {
    if (fontStyle === "italic") return "italic";
    if (fontStyle === "normal") return "normal";
    return style.italic ? "italic" : "normal";
  })();

  const formatWordCasing = (w: string) => {
    switch (textCasing) {
      case "title":
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      case "original":
        return w;
      case "uppercase":
      case "default":
      default:
        return w.toUpperCase();
    }
  };

  const resolvedFontWeight = (() => {
    switch (fontWeight) {
      case "light":
        return 300;
      case "regular":
        return 400;
      case "medium":
        return 500;
      case "bold":
        return 700;
      case "extra-bold":
        return 900;
      default:
        return style.bold ? 700 : 400;
    }
  })();

  // Word-by-word sequence animation ticker
  const words = (style.previewText || "VIRAL VIDEO CAPTIONS").trim().split(/\s+/);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % words.length);
    }, 750);
    return () => clearInterval(interval);
  }, [words.length]);

  // Convert clientY to position percentage
  const clientYToPosition = useCallback(
    (clientY: number) => {
      if (!screenRef.current) return position;

      const rect = screenRef.current.getBoundingClientRect();
      const relativeY = rect.bottom - clientY;
      const percentage = (relativeY / rect.height) * 100;

      return Math.round(
        Math.max(CAPTION_POSITION_MIN, Math.min(CAPTION_POSITION_MAX, percentage)),
      );
    },
    [position],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    isDraggingRef.current = true;
  }, []);

  useEffect(() => {
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;

      const clientY =
        "touches" in e
          ? (e.touches[0]?.clientY ?? 0)
          : e.clientY;

      onPositionChange(clientYToPosition(clientY));
    };

    const handleDragEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [clientYToPosition, onPositionChange]);

  const outlineTextShadow = buildLibassTextShadow(
    activeOutlineColor,
    style.previewOutlineSize,
    style.previewShadowDepth,
    style.animationType === "glow" || style.id === "cyberpunk",
    activeHighlightColor,
  );

  return (
    <div className="flex w-[232px] shrink-0 flex-col items-center gap-3">
      {/* Frosted Glass Phone chassis */}
      <div
        className={cn(
          "relative mx-auto rounded-[2.5rem] p-2 transition-all duration-300",
          "bg-oat-200/50 dark:bg-oat-900/60 backdrop-blur-2xl",
          "border border-white/50 dark:border-white/10",
          "shadow-[0_24px_56px_-18px_rgba(29,28,26,0.45),0_0_28px_rgba(62,137,104,0.14)]",
          "ring-1 ring-white/20 dark:ring-white/10",
        )}
        style={{ width: 232 }}
      >
        {/* Hardware side button notches on glass chassis */}
        <div className="absolute -left-[3px] top-20 h-8 w-[3px] rounded-l-xs bg-white/30 dark:bg-white/20" />
        <div className="absolute -left-[3px] top-32 h-8 w-[3px] rounded-l-xs bg-white/30 dark:bg-white/20" />
        <div className="absolute -right-[3px] top-24 h-12 w-[3px] rounded-r-xs bg-white/30 dark:bg-white/20" />

        {/* Specular glass reflection sheen over chassis */}
        <div className="pointer-events-none absolute inset-0 z-30 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-70" />

        {/* Dynamic Island */}
        <div className="absolute top-3.5 left-1/2 z-30 flex h-5 w-24 -translate-x-1/2 items-center justify-between rounded-full bg-black/85 px-2.5 backdrop-blur-md ring-1 ring-white/15">
          <div className="h-2 w-2 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500/60" />
        </div>

        {/* Inner screen */}
        <div
          className="relative overflow-hidden rounded-[2rem] shadow-inner"
          style={{ aspectRatio: "9 / 19.5" }}
        >
          <div ref={screenRef} className="relative h-full w-full select-none">
            {/* Backdrop scenes ensuring all light, dark, and vibrant colors are visible */}
            {activeBackdrop === "cinematic" && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black">
                {/* Atmospheric scene lights */}
                <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-moss-500/15 blur-3xl" />
                <div className="absolute top-1/3 -right-10 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
                <div className="absolute bottom-10 left-1/4 h-36 w-36 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />
              </div>
            )}

            {activeBackdrop === "dark" && (
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent)]" />
              </div>
            )}

            {activeBackdrop === "light" && (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-zinc-200 to-slate-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.08)_100%)]" />
              </div>
            )}

            {activeBackdrop === "grid" && (
              <div className="absolute inset-0 bg-zinc-900">
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #52525b 25%, transparent 25%),
                      linear-gradient(-45deg, #52525b 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #52525b 75%),
                      linear-gradient(-45deg, transparent 75%, #52525b 75%)
                    `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                />
              </div>
            )}

            {/* Draggable caption overlay */}
            <div
              className={cn(
                "absolute right-0 left-0 flex justify-center px-3 transition-[bottom] duration-100",
                "touch-none select-none",
                isDragging ? "cursor-grabbing" : "cursor-grab",
              )}
              style={{ bottom: `${position}%` }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <span
                className="pointer-events-none text-center leading-tight flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 max-w-[90%]"
                style={{
                  fontFamily: `${resolvedFontName}, ${style.fontNameFallback}, sans-serif`,
                  fontStyle: resolvedFontStyle,
                  fontSize: `${style.previewFontSize}px`,
                  letterSpacing: `${style.previewLetterSpacing}px`,
                }}
              >
                {words.map((word, i) => {
                  const isActive = i === activeWordIndex;
                  const displayWord = formatWordCasing(word);

                  // Weight transition
                  const wordWeight = (() => {
                    if (weightTransition === "light-to-bold") {
                      return isActive ? 900 : 300;
                    }
                    if (weightTransition === "bold-to-light") {
                      return isActive ? 300 : 900;
                    }
                    return resolvedFontWeight;
                  })();

                  // Box style (e.g. crimson-pop or custom background)
                  const hasBox = isBoxStyle && activeBackgroundColor.toLowerCase() !== "none";

                  if (isActive) {
                    if (hasBox) {
                      return (
                        <span
                          key={`${word}-${i}`}
                          className="inline-block transition-all duration-150 transform scale-105"
                          style={{
                            backgroundColor: activeBackgroundColor,
                            color: activePrimaryColor,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                            fontWeight: wordWeight,
                            textShadow: "none",
                          }}
                        >
                          {displayWord}
                        </span>
                      );
                    }

                    // Active word without box: animated according to animationType
                    const activeTransform = (() => {
                      switch (style.animationType) {
                        case "bounce":
                          return "translateY(-5px) scale(1.12)";
                        case "scale":
                        case "pop":
                          return "scale(1.15)";
                        case "box":
                          return "scale(1.10)";
                        default:
                          return "scale(1.05)";
                      }
                    })();

                    const activeGlowFilter =
                      style.animationType === "glow" || style.id === "cyberpunk"
                        ? `drop-shadow(0 0 8px ${activeHighlightColor}) drop-shadow(0 0 16px ${activeHighlightColor})`
                        : undefined;

                    return (
                      <span
                        key={`${word}-${i}`}
                        className="inline-block transition-all duration-150"
                        style={{
                          color: activeHighlightColor,
                          fontWeight: wordWeight,
                          transform: activeTransform,
                          textShadow: outlineTextShadow,
                          filter: activeGlowFilter,
                        }}
                      >
                        {displayWord}
                      </span>
                    );
                  }

                  // Inactive word
                  return (
                    <span
                      key={`${word}-${i}`}
                      className="inline-block transition-all duration-150"
                      style={{
                        color: activePrimaryColor,
                        fontWeight: wordWeight,
                        textShadow: outlineTextShadow,
                      }}
                    >
                      {displayWord}
                    </span>
                  );
                })}
              </span>
            </div>

            {/* Drag reposition hint */}
            {!isDragging && (
              <div
                className="absolute right-0 left-0 text-center text-[9px] text-white/50 drop-shadow-xs"
                style={{ bottom: `calc(${position}% - 18px)` }}
              >
                Drag to reposition
              </div>
            )}

            {/* Glass Home indicator bar */}
            <div className="absolute bottom-1.5 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40 backdrop-blur-xs" />
          </div>
        </div>
      </div>

      {/* Backdrop scene selector — icon-first so four options fit the
          phone's own width without wrapping. */}
      <div className="flex w-full items-center gap-0.5 rounded-full border border-line bg-surface-2 p-0.5">
        {BACKDROP_SCENES.map((scene) => {
          const Icon = scene.icon;
          const isSelected = activeBackdrop === scene.id;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => setActiveBackdrop(scene.id)}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-medium transition-all duration-200",
                isSelected
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-faint hover:text-ink",
              )}
              title={`Preview against ${scene.label} backdrop`}
              aria-label={`${scene.label} backdrop`}
              aria-pressed={isSelected}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span className="truncate">{scene.label}</span>
            </button>
          );
        })}
      </div>

      {/* Position presets */}
      <div className="flex w-full items-center gap-1.5">
        <span className="text-eyebrow shrink-0 text-ink-faint">Pos</span>
        {POSITION_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPositionChange(preset.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-full border px-2 py-1 text-[11px] font-medium transition-all duration-200",
              position === preset.value
                ? "border-brand bg-brand-wash text-brand"
                : "border-line bg-surface text-ink-subtle hover:border-line-strong hover:text-ink",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
