"use client";

import {
  Sparkles,
  Type,
  Palette,
  SlidersHorizontal,
  Flame,
  RotateCcw,
} from "lucide-react";
import {
  CAPTION_STYLES,
  CAPTION_STYLE_CONFIGS,
  CAPTION_POSITION_MIN,
  CAPTION_POSITION_MAX,
} from "~/lib/caption-styles";
import {
  type CaptionStyle,
  type AnimationType,
  type FontWeightOption,
  type FontStyleOption,
  type TextCasingOption,
  TOP_CAPTION_FONTS,
} from "~/types/caption";

interface StyleMotionEditorProps {
  selectedStyle: CaptionStyle;
  onSelectStyle: (style: CaptionStyle) => void;
  animationType: AnimationType;
  onChangeAnimationType: (anim: AnimationType) => void;
  customFont: string | null;
  onChangeFont: (font: string | null) => void;
  fontWeight: FontWeightOption;
  onChangeFontWeight: (weight: FontWeightOption) => void;
  fontStyle: FontStyleOption;
  onChangeFontStyle: (style: FontStyleOption) => void;
  textCasing: TextCasingOption;
  onChangeTextCasing: (casing: TextCasingOption) => void;
  primaryColor: string | null;
  onChangePrimaryColor: (color: string | null) => void;
  highlightColor: string | null;
  onChangeHighlightColor: (color: string | null) => void;
  outlineColor: string | null;
  onChangeOutlineColor: (color: string | null) => void;
  backgroundColor: string | null;
  onChangeBackgroundColor: (color: string | null) => void;
  captionPosition: number;
  onChangeCaptionPosition: (pos: number) => void;
  onResetDefaults: () => void;
}

const ANIMATION_TYPES: { id: AnimationType; name: string; desc: string }[] = [
  { id: "pop", name: "Pop / Spring", desc: "Punchy bouncy scale on active word" },
  { id: "karaoke", name: "Karaoke Wipe", desc: "Smooth color fill from left to right" },
  { id: "glow", name: "Neon Glow", desc: "Radiant electric glow around word" },
  { id: "box", name: "Box / Pill", desc: "Solid colored pill highlight behind word" },
  { id: "bounce", name: "Jump Bounce", desc: "Playful spring bounce on active word" },
  { id: "scale", name: "Smooth Zoom", desc: "Gentle enlargement on active word" },
  { id: "highlight", name: "Color Highlight", desc: "Clean active word color switch" },
];

export function StyleMotionEditor({
  selectedStyle,
  onSelectStyle,
  animationType,
  onChangeAnimationType,
  customFont,
  onChangeFont,
  fontWeight,
  onChangeFontWeight,
  fontStyle,
  onChangeFontStyle,
  textCasing,
  onChangeTextCasing,
  primaryColor,
  onChangePrimaryColor,
  highlightColor,
  onChangeHighlightColor,
  outlineColor,
  onChangeOutlineColor,
  backgroundColor,
  onChangeBackgroundColor,
  captionPosition,
  onChangeCaptionPosition,
  onResetDefaults,
}: StyleMotionEditorProps) {
  const currentConfig = CAPTION_STYLE_CONFIGS[selectedStyle];

  const effectivePrimary = primaryColor || currentConfig.primaryColor;
  const effectiveHighlight = highlightColor || currentConfig.highlightColor;
  const effectiveOutline = outlineColor || currentConfig.outlineColor;
  const effectiveBg = backgroundColor || currentConfig.backgroundColor || currentConfig.highlightColor;

  return (
    <div className="space-y-6 p-5 overflow-y-auto" style={{ maxHeight: "calc(70vh - 40px)" }}>
      {/* Section 1: Style Presets */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            <Flame className="h-3.5 w-3.5 text-highlight" />
            Motion Style Presets
          </label>
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Reset customizations to style defaults"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to default
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CAPTION_STYLES.map((styleKey) => {
            const config = CAPTION_STYLE_CONFIGS[styleKey];
            const isSelected = selectedStyle === styleKey;

            return (
              <button
                key={styleKey}
                onClick={() => onSelectStyle(styleKey)}
                className={`relative flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-brand bg-brand/5 shadow-sm ring-2 ring-brand/20 dark:bg-brand/10 dark:ring-brand/30"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1.5 mb-1.5">
                  <span className="truncate text-xs font-bold text-ink">
                    {config.name}
                  </span>
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                    style={{
                      background: `linear-gradient(135deg, ${config.primaryColor} 50%, ${config.highlightColor} 50%)`,
                    }}
                  />
                </div>
                <p className="line-clamp-1 text-[10px] text-ink-subtle">
                  {config.bestFor}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Motion / Animation Type */}
      <div>
        <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Motion Animation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ANIMATION_TYPES.map((anim) => {
            const isSelected = animationType === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => onChangeAnimationType(anim.id)}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-brand bg-brand/10 text-brand shadow-sm ring-1 ring-brand"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                <span className="text-xs font-bold">{anim.name}</span>
                <span className="text-[10px] text-ink-subtle">{anim.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Typography */}
      <div>
        <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
          <Type className="h-3.5 w-3.5 text-sky-400" />
          Typography
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Font Family */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Font Family
            </label>
            <select
              value={customFont || currentConfig.fontName}
              onChange={(e) => onChangeFont(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {TOP_CAPTION_FONTS.map((f) => (
                <option key={f.name} value={f.family}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          {/* Text Casing */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Casing
            </label>
            <select
              value={textCasing}
              onChange={(e) => onChangeTextCasing(e.target.value as TextCasingOption)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="uppercase">UPPERCASE (TikTok Standard)</option>
              <option value="title">Title Case</option>
              <option value="original">Original As-Spoken</option>
              <option value="default">Style Default</option>
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Font Weight
            </label>
            <select
              value={fontWeight}
              onChange={(e) => onChangeFontWeight(e.target.value as FontWeightOption)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="default">Default</option>
              <option value="bold">Bold (700)</option>
              <option value="extra-bold">Extra Bold (900)</option>
              <option value="medium">Medium (500)</option>
              <option value="regular">Regular (400)</option>
            </select>
          </div>

          {/* Font Style */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Style (Italic / Normal)
            </label>
            <select
              value={fontStyle}
              onChange={(e) => onChangeFontStyle(e.target.value as FontStyleOption)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="default">Default</option>
              <option value="italic">Italic</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Colors */}
      <div>
        <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
          <Palette className="h-3.5 w-3.5 text-iris-400" />
          Color Palette
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Primary Text */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Main Text
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effectivePrimary}
                onChange={(e) => onChangePrimaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border border-gray-300 p-0.5 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-ink-muted">
                {effectivePrimary}
              </span>
            </div>
          </div>

          {/* Highlight Color */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Active Word
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effectiveHighlight}
                onChange={(e) => onChangeHighlightColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border border-gray-300 p-0.5 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-ink-muted">
                {effectiveHighlight}
              </span>
            </div>
          </div>

          {/* Outline Color */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Outline
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effectiveOutline}
                onChange={(e) => onChangeOutlineColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border border-gray-300 p-0.5 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-ink-muted">
                {effectiveOutline}
              </span>
            </div>
          </div>

          {/* Box / Background */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Box / Pill
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effectiveBg}
                onChange={(e) => onChangeBackgroundColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border border-gray-300 p-0.5 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-ink-muted">
                {effectiveBg}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Caption Position Slider */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            <SlidersHorizontal className="h-3.5 w-3.5 text-moss-500" />
            Vertical Position: {captionPosition}%
          </label>
          <span className="text-[11px] text-gray-400">from bottom</span>
        </div>
        <input
          type="range"
          min={CAPTION_POSITION_MIN}
          max={CAPTION_POSITION_MAX}
          value={captionPosition}
          onChange={(e) => onChangeCaptionPosition(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-brand"
        />
        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>Lower third (5%)</span>
          <span>Middle (25%)</span>
          <span>Center (50%)</span>
        </div>
      </div>
    </div>
  );
}
