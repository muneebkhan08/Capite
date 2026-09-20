"use client";

import { useState } from "react";
import { Palette, Sparkles, Globe, ArrowRight, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { VideoDropzone } from "~/components/video-dropzone";
import { CaptionStylePicker } from "~/components/caption-style-picker";
import { CaptionPreview } from "~/components/caption-preview";
import { ProcessingView } from "~/components/processing-view";
import { submitCaptionJob } from "~/actions/captions";
import {
  CAPTION_STYLE_CONFIGS,
  DEFAULT_CAPTION_STYLE,
  DEFAULT_CAPTION_POSITION,
} from "~/lib/caption-styles";
import {
  type CaptionStyle,
  type FontWeightOption,
  type WeightTransitionOption,
  type FontStyleOption,
  type TextCasingOption,
} from "~/types/caption";

type ViewState = "idle" | "uploading" | "processing" | "complete";

const trustIndicators = [
  { icon: Palette, text: "27 motion styles", tint: "bg-iris-100 text-iris-500 dark:bg-iris-500/15 dark:text-iris-300" },
  { icon: Sparkles, text: "Word-level script editor", tint: "bg-lemon-100 text-lemon-600 dark:bg-lemon-400/15 dark:text-lemon-300" },
  { icon: Globe, text: "100+ languages", tint: "bg-sky-100 text-sky-500 dark:bg-sky-400/15 dark:text-sky-300" },
];

const stats = [
  { value: "27", label: "Caption styles" },
  { value: "100+", label: "Languages" },
  { value: "$0", label: "Always free" },
];

/** Numbered column header, borrowed from imagine.art's panel labelling. */
function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-eyebrow grid h-[18px] w-[18px] place-items-center rounded-full bg-brand text-[10px] text-brand-ink">
        {n}
      </span>
      <span className="text-eyebrow text-ink-faint">{children}</span>
    </div>
  );
}

export function HeroSection() {
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number>(0);
  const [selectedStyle, setSelectedStyle] =
    useState<CaptionStyle>(DEFAULT_CAPTION_STYLE);
  const [customFont, setCustomFont] = useState<string | null>(null);
  const [fontWeight, setFontWeight] = useState<FontWeightOption>("default");
  const [weightTransition, setWeightTransition] =
    useState<WeightTransitionOption>("none");
  const [fontStyle, setFontStyle] = useState<FontStyleOption>("default");
  const [textCasing, setTextCasing] = useState<TextCasingOption>("default");
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [highlightColor, setHighlightColor] = useState<string | null>(null);
  const [outlineColor, setOutlineColor] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [captionPosition, setCaptionPosition] = useState(
    DEFAULT_CAPTION_POSITION,
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStyleChange = (newStyle: CaptionStyle) => {
    setSelectedStyle(newStyle);
    setCustomFont(null);
    setFontWeight("default");
    setWeightTransition("none");
    setFontStyle("default");
    setTextCasing("default");
    setPrimaryColor(null);
    setHighlightColor(null);
    setOutlineColor(null);
    setBackgroundColor(null);
  };

  const handleFileSelect = (selectedFile: File, duration: number) => {
    setFile(selectedFile);
    setFileDuration(duration);
    setError(null);
  };

  const handleFileClear = () => {
    setFile(null);
    setFileDuration(0);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setViewState("uploading");
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("captionStyle", selectedStyle);
    formData.append("captionPosition", String(captionPosition));
    formData.append("durationSeconds", String(fileDuration));
    if (customFont) {
      formData.append("customFont", customFont);
    }
    if (fontWeight !== "default") {
      formData.append("fontWeight", fontWeight);
    }
    if (weightTransition !== "none") {
      formData.append("weightTransition", weightTransition);
    }
    if (fontStyle !== "default") {
      formData.append("fontStyle", fontStyle);
    }
    if (textCasing !== "default") {
      formData.append("textCasing", textCasing);
    }
    if (primaryColor) {
      formData.append("primaryColor", primaryColor);
    }
    if (highlightColor) {
      formData.append("highlightColor", highlightColor);
    }
    if (outlineColor) {
      formData.append("outlineColor", outlineColor);
    }
    if (backgroundColor) {
      formData.append("backgroundColor", backgroundColor);
    }

    // Simulate upload progress while the server action runs
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    const result = await submitCaptionJob(formData);
    clearInterval(progressInterval);

    if ("error" in result) {
      setError(result.error);
      setViewState("idle");
      setUploadProgress(null);
      return;
    }

    setUploadProgress(100);
    setJobId(result.jobId);
    setViewState("processing");
    setUploadProgress(null);
  };

  const handleProcessingComplete = (completedJobId: string) => {
    setViewState("complete");
    router.push(`/captions/${completedJobId}`);
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setViewState("idle");
    setFile(null);
    setFileDuration(0);
    setUploadProgress(null);
    setJobId(null);
  };

  const isUploading = viewState === "uploading";
  const isProcessing = viewState === "processing";
  const styleConfig = CAPTION_STYLE_CONFIGS[selectedStyle];

  return (
    <section className="bg-grain relative overflow-hidden pt-16">
      {/* Layered background: aurora wash over an engineering grid. */}
      <div aria-hidden className="bg-aurora absolute inset-0" />
      <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas"
      />

      <div className="relative z-10 container mx-auto px-6 pt-16 pb-20">
        {/* ---------------- Headline block ---------------- */}
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1.5 pr-4 pl-1.5 shadow-xs backdrop-blur-sm"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-wash">
              <span className="animate-soft-pulse h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            <span className="text-[12.5px] font-medium tracking-[-0.01em] text-ink-muted">
              Free &amp; open source — no account, no limits
            </span>
          </div>

          <h1
            className="text-display animate-fade-up mb-6 text-[3.25rem] text-ink sm:text-6xl lg:text-[4.5rem]"
            style={{ "--stagger": "0.06s" } as React.CSSProperties}
          >
            Capite
            <br />
            <span className="text-brand">AI Video Captions</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mb-9 max-w-[54ch] text-[17px] leading-relaxed text-ink-muted sm:text-lg"
            style={{ "--stagger": "0.12s" } as React.CSSProperties}
          >
            Drop in a video and get back{" "}
            <span className="text-editorial text-[1.12em] text-ink">
              caption motion
            </span>{" "}
            that actually holds attention — 27 styles, word-level timing you can
            edit, and export in any format.
          </p>

          <div
            className="animate-fade-up mb-4 flex flex-wrap items-center justify-center gap-2"
            style={{ "--stagger": "0.18s" } as React.CSSProperties}
          >
            {trustIndicators.map((indicator) => (
              <div
                key={indicator.text}
                className="flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1.5 pr-3.5 pl-1.5 backdrop-blur-sm"
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full ${indicator.tint}`}
                >
                  <indicator.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12.5px] font-medium text-ink-muted">
                  {indicator.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Workbench ---------------- */}
        <div
          id="upload"
          className="animate-fade-up mx-auto mt-12 max-w-5xl"
          style={{ "--stagger": "0.24s" } as React.CSSProperties}
        >
          <div className="surface-card overflow-hidden shadow-xl">
            {isProcessing && jobId ? (
              <div className="p-5 sm:p-6">
                <ProcessingView
                  jobId={jobId}
                  onComplete={handleProcessingComplete}
                  onError={handleProcessingError}
                />
              </div>
            ) : (
              <>
                {/* Card chrome — a window bar that frames the tool */}
                <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-2/60 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-[15px] w-[15px] text-brand" />
                    <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
                      Caption studio
                    </span>
                  </div>
                  <span className="text-eyebrow hidden text-ink-faint sm:block">
                    Runs on your machine
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-brick-200 bg-brick-50 px-4 py-3 dark:border-brick-400/30 dark:bg-brick-400/10">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brick-400 text-[11px] font-bold text-white">
                        !
                      </span>
                      <p className="text-sm leading-relaxed text-brick-600 dark:text-brick-200">
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-8">
                    {/* Left: source + style */}
                    <div className="flex min-w-0 flex-1 flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <StepLabel n={1}>Source video</StepLabel>
                        <VideoDropzone
                          file={file}
                          onFileSelect={handleFileSelect}
                          onFileClear={handleFileClear}
                          uploadProgress={uploadProgress}
                          disabled={isUploading}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <StepLabel n={2}>Caption style</StepLabel>
                        <CaptionStylePicker
                          selectedStyle={selectedStyle}
                          onStyleChange={handleStyleChange}
                          customFont={customFont}
                          onFontChange={setCustomFont}
                          fontWeight={fontWeight}
                          onFontWeightChange={setFontWeight}
                          weightTransition={weightTransition}
                          onWeightTransitionChange={setWeightTransition}
                          fontStyle={fontStyle}
                          onFontStyleChange={setFontStyle}
                          textCasing={textCasing}
                          onTextCasingChange={setTextCasing}
                          primaryColor={primaryColor}
                          onPrimaryColorChange={setPrimaryColor}
                          highlightColor={highlightColor}
                          onHighlightColorChange={setHighlightColor}
                          outlineColor={outlineColor}
                          onOutlineColorChange={setOutlineColor}
                          backgroundColor={backgroundColor}
                          onBackgroundColorChange={setBackgroundColor}
                        />
                      </div>
                    </div>

                    {/* Right: live preview */}
                    <div className="flex shrink-0 flex-col gap-3 lg:w-[232px]">
                      <StepLabel n={3}>Live preview</StepLabel>
                      <div className="flex justify-center lg:justify-start">
                        <CaptionPreview
                          style={styleConfig}
                          position={captionPosition}
                          onPositionChange={setCaptionPosition}
                          customFont={customFont}
                          fontWeight={fontWeight}
                          weightTransition={weightTransition}
                          fontStyle={fontStyle}
                          textCasing={textCasing}
                          customPrimaryColor={primaryColor}
                          customHighlightColor={highlightColor}
                          customOutlineColor={outlineColor}
                          customBackgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="flex flex-col gap-3 border-t border-line bg-surface-2/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-ink-faint">
                    MP4, MOV or WebM · up to 500&nbsp;MB · nothing leaves your
                    server
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!file || isUploading}
                    className="btn-accent group inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-[15px] sm:w-auto"
                  >
                    {isUploading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        Generate captions
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ---------------- Stats ---------------- */}
        <div
          className="animate-fade-in mx-auto mt-16 max-w-2xl"
          style={{ "--stagger": "0.4s" } as React.CSSProperties}
        >
          <div className="rule-fade mb-8" />
          <div className="grid grid-cols-3 divide-x divide-line">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 text-center">
                <div className="numeric text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-[2rem]">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[12.5px] text-ink-faint">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
