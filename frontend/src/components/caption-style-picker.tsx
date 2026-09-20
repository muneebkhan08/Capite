"use client";

import { useState } from "react";
import {
  Sparkles,
  Type,
  Flame,
  SlidersHorizontal,
  RotateCcw,
  Layers,
  ArrowRightLeft,
  Palette,
  Ban,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { CAPTION_STYLES, CAPTION_STYLE_CONFIGS } from "~/lib/caption-styles";
import {
  type CaptionStyle,
  type CaptionCategory,
  type FontWeightOption,
  type WeightTransitionOption,
  type FontStyleOption,
  type TextCasingOption,
  TOP_CAPTION_FONTS,
} from "~/types/caption";

interface CaptionStylePickerProps {
  selectedStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  customFont?: string | null;
  onFontChange?: (font: string | null) => void;
  fontWeight?: FontWeightOption;
  onFontWeightChange?: (weight: FontWeightOption) => void;
  weightTransition?: WeightTransitionOption;
  onWeightTransitionChange?: (transition: WeightTransitionOption) => void;
  fontStyle?: FontStyleOption;
  onFontStyleChange?: (fontStyle: FontStyleOption) => void;
  textCasing?: TextCasingOption;
  onTextCasingChange?: (textCasing: TextCasingOption) => void;
  primaryColor?: string | null;
  onPrimaryColorChange?: (color: string | null) => void;
  highlightColor?: string | null;
  onHighlightColorChange?: (color: string | null) => void;
  outlineColor?: string | null;
  onOutlineColorChange?: (color: string | null) => void;
  backgroundColor?: string | null;
  onBackgroundColorChange?: (color: string | null) => void;
}

const CATEGORIES: { id: CaptionCategory; label: string }[] = [
  { id: "all", label: "All Styles" },
  { id: "trending", label: "Trending" },
  { id: "clean-tech", label: "Clean & Tech" },
  { id: "editorial-film", label: "Editorial & Film" },
  { id: "pop-expressive", label: "Pop & Expressive" },
];

const FONT_WEIGHT_OPTIONS: { id: FontWeightOption; label: string; weight: number | null }[] = [
  { id: "default", label: "Theme Default", weight: null },
  { id: "light", label: "Light (300)", weight: 300 },
  { id: "regular", label: "Regular (400)", weight: 400 },
  { id: "medium", label: "Medium (500)", weight: 500 },
  { id: "bold", label: "Bold (700)", weight: 700 },
  { id: "extra-bold", label: "Extra Bold (900)", weight: 900 },
];

const WEIGHT_TRANSITION_OPTIONS: {
  id: WeightTransitionOption;
  title: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "none",
    title: "Uniform Weight",
    description: "Consistent font weight across all words",
    badge: "Standard",
  },
  {
    id: "light-to-bold",
    title: "Light → Bold Pop",
    description: "Inactive words are light; active spoken word pops into bold",
    badge: "Trending",
  },
  {
    id: "bold-to-light",
    title: "Bold → Light Pop",
    description: "Inactive words are bold; active spoken word switches to light",
    badge: "Inverted",
  },
];

const FONT_STYLE_OPTIONS: { id: FontStyleOption; label: string; italic: boolean | null }[] = [
  { id: "default", label: "Theme Default", italic: null },
  { id: "normal", label: "Normal (Upright)", italic: false },
  { id: "italic", label: "Italic (Slanted)", italic: true },
];

const TEXT_CASING_OPTIONS: { id: TextCasingOption; label: string; example: string }[] = [
  { id: "default", label: "Theme Default", example: "Default" },
  { id: "uppercase", label: "UPPERCASE", example: "VIRAL" },
  { id: "title", label: "Title Case", example: "Viral" },
  { id: "original", label: "As Spoken", example: "natural" },
];

const POPULAR_TEXT_COLORS = [
  { label: "Pure White", hex: "#FFFFFF" },
  { label: "Off White", hex: "#F8FAFC" },
  { label: "Yellow", hex: "#FFFF00" },
  { label: "Cyan", hex: "#00FFFF" },
  { label: "Pastel Oat", hex: "#FFFBF5" },
  { label: "Muted Slate", hex: "#94A3B8" },
  { label: "Dark Slate", hex: "#0F172A" },
];

const POPULAR_HIGHLIGHT_COLORS = [
  { label: "Crimson Red", hex: "#E11D48" },
  { label: "Vibrant Scarlet", hex: "#EF4444" },
  { label: "Flame Orange", hex: "#FF6600" },
  { label: "Amber Gold", hex: "#F59E0B" },
  { label: "Cyber Cyan", hex: "#00FFFF" },
  { label: "Neon Pink", hex: "#FF007F" },
  { label: "Electric Purple", hex: "#A855F7" },
  { label: "Matrix Green", hex: "#22C55E" },
  { label: "Clean White", hex: "#FFFFFF" },
  { label: "Pitch Black", hex: "#000000" },
];

const POPULAR_OUTLINE_COLORS = [
  { label: "Black", hex: "#000000" },
  { label: "Dark Slate", hex: "#0F172A" },
  { label: "Dark Crimson", hex: "#881337" },
  { label: "Charcoal", hex: "#18181B" },
  { label: "White", hex: "#FFFFFF" },
];

const POPULAR_BACKGROUND_COLORS = [
  { label: "Crimson Red", hex: "#E11D48" },
  { label: "Vibrant Scarlet", hex: "#EF4444" },
  { label: "Amber Gold", hex: "#F59E0B" },
  { label: "Emerald Green", hex: "#10B981" },
  { label: "Neon Cyan", hex: "#06B6D4" },
  { label: "Electric Blue", hex: "#3B82F6" },
  { label: "Deep Purple", hex: "#8B5CF6" },
  { label: "Solid Black", hex: "#000000" },
  { label: "Charcoal Slate", hex: "#1E293B" },
  { label: "Clean White", hex: "#FFFFFF" },
];

const QUICK_PALETTES = [
  {
    name: "Crimson Pop",
    primary: "#FFFFFF",
    highlight: "#E11D48",
    outline: "#000000",
  },
  {
    name: "Hormozi Cyan",
    primary: "#FFFFFF",
    highlight: "#00FFFF",
    outline: "#000000",
  },
  {
    name: "MrBeast Orange",
    primary: "#FFFF00",
    highlight: "#FF6600",
    outline: "#000000",
  },
  {
    name: "Cyber Neon",
    primary: "#00F0FF",
    highlight: "#FF007F",
    outline: "#050515",
  },
  {
    name: "Matrix Green",
    primary: "#F8FAFC",
    highlight: "#22C55E",
    outline: "#020617",
  },
  {
    name: "Amber Gold",
    primary: "#FFFFFF",
    highlight: "#F59E0B",
    outline: "#18181B",
  },
  {
    name: "Royal Violet",
    primary: "#FFFFFF",
    highlight: "#A855F7",
    outline: "#000000",
  },
  {
    name: "Monochrome",
    primary: "#F8FAFC",
    highlight: "#000000",
    outline: "#FFFFFF",
  },
];

export function CaptionStylePicker({
  selectedStyle,
  onStyleChange,
  customFont = null,
  onFontChange,
  fontWeight = "default",
  onFontWeightChange,
  weightTransition = "none",
  onWeightTransitionChange,
  fontStyle = "default",
  onFontStyleChange,
  textCasing = "default",
  onTextCasingChange,
  primaryColor = null,
  onPrimaryColorChange,
  highlightColor = null,
  onHighlightColorChange,
  outlineColor = null,
  onOutlineColorChange,
  backgroundColor = null,
  onBackgroundColorChange,
}: CaptionStylePickerProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "typography" | "colors">("presets");
  const [activeCategory, setActiveCategory] = useState<CaptionCategory>("all");
  const selectedConfig = CAPTION_STYLE_CONFIGS[selectedStyle];

  const effectivePrimary = primaryColor || selectedConfig.primaryColor;
  const effectiveHighlight = highlightColor || selectedConfig.highlightColor;
  const effectiveOutline = outlineColor !== null ? outlineColor : selectedConfig.outlineColor;
  const isBoxStyle = selectedConfig.animationType === "box" || selectedConfig.id === "crimson-pop";
  const effectiveBackground =
    backgroundColor !== null
      ? backgroundColor
      : isBoxStyle
        ? selectedConfig.highlightColor
        : "none";

  const filteredStyles = CAPTION_STYLES.filter((style) => {
    if (activeCategory === "all") return true;
    const config = CAPTION_STYLE_CONFIGS[style];
    return config.category === activeCategory;
  });

  const isTypographyCustomized =
    customFont !== null ||
    fontWeight !== "default" ||
    weightTransition !== "none" ||
    fontStyle !== "default" ||
    textCasing !== "default";
  const isColorCustomized =
    primaryColor !== null ||
    highlightColor !== null ||
    outlineColor !== null ||
    backgroundColor !== null;
  const isCustomized = isTypographyCustomized || isColorCustomized;

  const handleResetTypography = () => {
    onFontChange?.(null);
    onFontWeightChange?.("default");
    onWeightTransitionChange?.("none");
    onFontStyleChange?.("default");
    onTextCasingChange?.("default");
  };

  const handleResetColors = () => {
    onPrimaryColorChange?.(null);
    onHighlightColorChange?.(null);
    onOutlineColorChange?.(null);
    onBackgroundColorChange?.(null);
  };

  const handleSwapColors = () => {
    const p = effectivePrimary;
    const h = effectiveHighlight;
    onPrimaryColorChange?.(h);
    onHighlightColorChange?.(p);
  };

  const handleResetAll = () => {
    if (activeTab === "colors") {
      handleResetColors();
    } else if (activeTab === "typography") {
      handleResetTypography();
    } else {
      handleResetTypography();
      handleResetColors();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Mode Selector Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5 rounded-full border border-line bg-surface-2 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 cursor-pointer",
              activeTab === "presets"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-subtle hover:text-ink",
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Preset Themes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 cursor-pointer",
              activeTab === "typography"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-subtle hover:text-ink",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Fonts & Weight
            {isTypographyCustomized && (
              <span className="h-1.5 w-1.5 rounded-full bg-lemon-400 ring-2 ring-surface" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 cursor-pointer",
              activeTab === "colors"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-subtle hover:text-ink",
            )}
          >
            <Palette className="h-3.5 w-3.5" />
            Colors
            {isColorCustomized && (
              <span className="h-1.5 w-1.5 rounded-full bg-clay-400 ring-2 ring-surface" />
            )}
          </button>
        </div>

        {isCustomized && (
          <button
            type="button"
            onClick={handleResetAll}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-subtle transition-colors hover:border-line-strong hover:text-ink"
            title="Reset customizations"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* VIEW 1: PRESET THEMES */}
      {activeTab === "presets" && (
        <div className="space-y-3">
          {/* Category filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const count =
                cat.id === "all"
                  ? CAPTION_STYLES.length
                  : CAPTION_STYLES.filter(
                      (s) => CAPTION_STYLE_CONFIGS[s].category === cat.id,
                    ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-all duration-200",
                    activeCategory === cat.id
                      ? "border-brand-edge bg-brand-wash text-brand"
                      : "border-line bg-surface text-ink-subtle hover:border-line-strong hover:text-ink",
                  )}
                >
                  {cat.label}{" "}
                  <span className="numeric text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Style pills grid */}
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 py-0.5">
            {filteredStyles.map((style) => {
              const config = CAPTION_STYLE_CONFIGS[style];
              const isSelected = selectedStyle === style;

              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => onStyleChange(style)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
                    "border transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-brand bg-brand-wash text-ink shadow-[0_0_0_3px] shadow-brand/12 font-medium"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full shadow-xs ring-1 ring-ink/15"
                    style={{
                      background: `linear-gradient(135deg, ${config.primaryColor} 50%, ${config.highlightColor} 50%)`,
                    }}
                  />
                  <span
                    className="truncate"
                    style={{
                      fontFamily: config.fontName,
                      fontStyle: config.italic ? "italic" : "normal",
                    }}
                  >
                    {config.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: FONTS & TRANSITIONS CUSTOMIZATION */}
      {activeTab === "typography" && (
        <div className="space-y-4">
          {/* Top Fonts Selection Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-brand" />
                Top Caption Fonts
              </span>
              <span className="text-[11px] text-muted-foreground">
                Active: <span className="text-brand font-medium">{customFont || `${selectedConfig.fontName} (Preset)`}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 py-1">
              <button
                type="button"
                onClick={() => onFontChange?.(null)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 border cursor-pointer",
                  customFont === null
                    ? "border-brand bg-brand/15 text-brand font-semibold"
                    : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                )}
              >
                Default ({selectedConfig.fontName})
              </button>

              {TOP_CAPTION_FONTS.map((font) => {
                const isSelected = customFont === font.family;
                return (
                  <button
                    key={font.family}
                    type="button"
                    onClick={() => onFontChange?.(font.family)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 border cursor-pointer flex items-center gap-1.5",
                      isSelected
                        ? "border-brand bg-brand/15 text-brand font-semibold"
                        : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                    style={{ fontFamily: font.family }}
                  >
                    <span>{font.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Weight Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Base Font Weight</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {FONT_WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFontWeightChange?.(opt.id)}
                  className={cn(
                    "rounded-lg py-1.5 px-2 text-[11px] font-medium border transition-all text-center cursor-pointer",
                    fontWeight === opt.id
                      ? "border-brand bg-brand/15 text-brand font-semibold"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Transition Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-brand" />
                Dynamic Weight Transitions
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {WEIGHT_TRANSITION_OPTIONS.map((opt) => {
                const isSelected = weightTransition === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onWeightTransitionChange?.(opt.id)}
                    className={cn(
                      "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-brand bg-brand/10 ring-1 ring-brand"
                        : "border-border hover:border-brand/50 hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {opt.title}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-medium",
                          isSelected
                            ? "bg-brand text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Style (Normal vs Italic) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Font Style (Posture)</span>
              <span className="text-[11px] text-muted-foreground">
                Current: <span className="text-brand font-medium">{fontStyle === "default" ? (selectedConfig.italic ? "Italic (Preset Default)" : "Normal (Preset Default)") : fontStyle === "italic" ? "Italic (Slanted)" : "Normal (Upright)"}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {FONT_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFontStyleChange?.(opt.id)}
                  className={cn(
                    "rounded-lg py-1.5 px-2 text-[11px] font-medium border transition-all text-center cursor-pointer",
                    fontStyle === opt.id
                      ? "border-brand bg-brand/15 text-brand font-semibold"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                  style={{
                    fontStyle: opt.id === "italic" ? "italic" : opt.id === "normal" ? "normal" : (selectedConfig.italic ? "italic" : "normal"),
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Casing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Text Casing</span>
              <span className="text-[11px] text-muted-foreground">
                Active: <span className="text-brand font-medium">{textCasing === "default" ? "Theme Default" : textCasing === "uppercase" ? "UPPERCASE" : textCasing === "title" ? "Title Case" : "As Spoken"}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TEXT_CASING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTextCasingChange?.(opt.id)}
                  className={cn(
                    "rounded-lg py-1.5 px-2 text-[11px] font-medium border transition-all text-center cursor-pointer flex flex-col items-center gap-0.5",
                    textCasing === opt.id
                      ? "border-brand bg-brand/15 text-brand font-semibold"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  <span>{opt.label}</span>
                  <span className="text-[9px] opacity-70">({opt.example})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: COLOR CUSTOMIZATION */}
      {activeTab === "colors" && (
        <div className="space-y-4">
          {/* Quick Palettes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Curated Color Palettes
              </span>
              <button
                type="button"
                onClick={handleSwapColors}
                className="flex items-center gap-1 text-[11px] text-brand hover:underline cursor-pointer"
                title="Swap primary and highlight colors"
              >
                <ArrowRightLeft className="h-3 w-3" />
                <span>Swap Colors</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 max-h-36 overflow-y-auto pr-1 py-1">
              {QUICK_PALETTES.map((palette) => {
                const isActive =
                  effectivePrimary.toLowerCase() === palette.primary.toLowerCase() &&
                  effectiveHighlight.toLowerCase() === palette.highlight.toLowerCase();

                return (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => {
                      onPrimaryColorChange?.(palette.primary);
                      onHighlightColorChange?.(palette.highlight);
                      onOutlineColorChange?.(palette.outline);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg p-1.5 text-xs transition-all border cursor-pointer text-left",
                      isActive
                        ? "border-brand bg-brand/15 font-semibold text-foreground shadow-xs"
                        : "border-border hover:border-brand/40 hover:bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full shadow-xs ring-1 ring-ink/20"
                      style={{
                        background: `linear-gradient(135deg, ${palette.primary} 50%, ${palette.highlight} 50%)`,
                      }}
                    />
                    <span className="truncate text-[11px]">{palette.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color 1: Primary Text Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: effectivePrimary }}
                />
                Primary Text Color
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {effectivePrimary}
                </span>
                <label
                  className="relative inline-flex items-center justify-center h-5 w-5 rounded cursor-pointer border border-border overflow-hidden hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: effectivePrimary }}
                  title="Pick custom hex color"
                >
                  <input
                    type="color"
                    value={effectivePrimary.startsWith("#") ? effectivePrimary : "#FFFFFF"}
                    onChange={(e) => onPrimaryColorChange?.(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TEXT_COLORS.map((c) => {
                const isSelected = effectivePrimary.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => onPrimaryColorChange?.(c.hex)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] border transition-all cursor-pointer",
                      isSelected
                        ? "border-brand bg-brand/15 font-semibold text-foreground ring-1 ring-brand"
                        : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color 2: Highlight / Active Word Box Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: effectiveHighlight }}
                />
                Active Word / Box Highlight Color
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {effectiveHighlight}
                </span>
                <label
                  className="relative inline-flex items-center justify-center h-5 w-5 rounded cursor-pointer border border-border overflow-hidden hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: effectiveHighlight }}
                  title="Pick custom hex color"
                >
                  <input
                    type="color"
                    value={effectiveHighlight.startsWith("#") ? effectiveHighlight : "#E11D48"}
                    onChange={(e) => onHighlightColorChange?.(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {POPULAR_HIGHLIGHT_COLORS.map((c) => {
                const isSelected = effectiveHighlight.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => onHighlightColorChange?.(c.hex)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] border transition-all cursor-pointer",
                      isSelected
                        ? "border-brand bg-brand/15 font-semibold text-foreground ring-1 ring-brand"
                        : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color 3: Outline / Border Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full ring-1 ring-border",
                    effectiveOutline.toLowerCase() === "none" && "bg-transparent border border-dashed border-muted-foreground"
                  )}
                  style={{
                    backgroundColor:
                      effectiveOutline.toLowerCase() === "none" ? "transparent" : effectiveOutline,
                  }}
                />
                Outline / Border Color
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {effectiveOutline}
                </span>
                <label
                  className={cn(
                    "relative inline-flex items-center justify-center h-5 w-5 rounded cursor-pointer border border-border overflow-hidden hover:scale-110 transition-transform shadow-xs",
                    effectiveOutline.toLowerCase() === "none" && "opacity-40"
                  )}
                  style={{
                    backgroundColor:
                      effectiveOutline.toLowerCase() === "none" ? "#000000" : effectiveOutline,
                  }}
                  title="Pick custom hex color"
                >
                  <input
                    type="color"
                    value={effectiveOutline.startsWith("#") ? effectiveOutline : "#000000"}
                    onChange={(e) => onOutlineColorChange?.(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onOutlineColorChange?.(effectiveOutline.toLowerCase() === "none" ? null : "none")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] border transition-all cursor-pointer",
                  effectiveOutline.toLowerCase() === "none"
                    ? "border-rose-500 bg-rose-500/15 font-semibold text-foreground ring-1 ring-rose-500"
                    : "border-border text-muted-foreground hover:border-rose-500/40 hover:text-foreground",
                )}
              >
                <Ban className="h-3 w-3 text-rose-500" />
                <span>None (No Border)</span>
              </button>
              {POPULAR_OUTLINE_COLORS.map((c) => {
                const isSelected = effectiveOutline.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => onOutlineColorChange?.(c.hex)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] border transition-all cursor-pointer",
                      isSelected
                        ? "border-brand bg-brand/15 font-semibold text-foreground ring-1 ring-brand"
                        : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color 4: Background / Active Word Highlight Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full ring-1 ring-border",
                    effectiveBackground.toLowerCase() === "none" && "bg-transparent border border-dashed border-muted-foreground"
                  )}
                  style={{
                    backgroundColor:
                      effectiveBackground.toLowerCase() === "none" ? "transparent" : effectiveBackground,
                  }}
                />
                Active Word Highlight Box / Background
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {effectiveBackground}
                </span>
                <label
                  className={cn(
                    "relative inline-flex items-center justify-center h-5 w-5 rounded cursor-pointer border border-border overflow-hidden hover:scale-110 transition-transform shadow-xs",
                    effectiveBackground.toLowerCase() === "none" && "opacity-40"
                  )}
                  style={{
                    backgroundColor:
                      effectiveBackground.toLowerCase() === "none" ? "#E11D48" : effectiveBackground,
                  }}
                  title="Pick custom background hex color"
                >
                  <input
                    type="color"
                    value={effectiveBackground.startsWith("#") ? effectiveBackground : "#E11D48"}
                    onChange={(e) => onBackgroundColorChange?.(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onBackgroundColorChange?.(effectiveBackground.toLowerCase() === "none" ? null : "none")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] border transition-all cursor-pointer",
                  effectiveBackground.toLowerCase() === "none"
                    ? "border-rose-500 bg-rose-500/15 font-semibold text-foreground ring-1 ring-rose-500"
                    : "border-border text-muted-foreground hover:border-rose-500/40 hover:text-foreground",
                )}
              >
                <Ban className="h-3 w-3 text-rose-500" />
                <span>None (No Box)</span>
              </button>
              {POPULAR_BACKGROUND_COLORS.map((c) => {
                const isSelected = effectiveBackground.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => onBackgroundColorChange?.(c.hex)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] border transition-all cursor-pointer",
                      isSelected
                        ? "border-brand bg-brand/15 font-semibold text-foreground ring-1 ring-brand"
                        : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Style Detail Card */}
      <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-full ring-1 ring-black/20 shadow-xs"
              style={{
                background: `linear-gradient(135deg, ${effectivePrimary} 50%, ${effectiveHighlight} 50%)`,
              }}
            />
            <span className="font-semibold text-foreground text-sm">
              {selectedConfig.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
              <Type className="h-3 w-3" />
              {customFont ? `${customFont}*` : selectedConfig.fontName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand border border-brand/20 capitalize">
              <Sparkles className="h-3 w-3" />
              {selectedConfig.animationType}
            </span>
            {isColorCustomized && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#E11D48]/10 px-2 py-0.5 text-[10px] font-semibold text-[#E11D48] border border-[#E11D48]/20">
                <Palette className="h-3 w-3" />
                Custom Color
              </span>
            )}
            {weightTransition !== "none" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-highlight/15 px-2 py-0.5 text-[10px] font-semibold text-highlight border border-highlight/30">
                {weightTransition === "light-to-bold" ? "Light→Bold" : "Bold→Light"}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {selectedConfig.description}
        </p>

        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground border-t border-border/50">
          <Flame className="h-3 w-3 text-highlight" />
          <span>
            <strong className="font-medium text-foreground">Best for:</strong>{" "}
            {selectedConfig.bestFor}
          </span>
        </div>
      </div>
    </div>
  );
}
