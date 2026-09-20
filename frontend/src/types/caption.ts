export type CaptionStyle =
  | "hormozi"
  | "mrbeast"
  | "crimson-pop"
  | "podcast-hook"
  | "wealth-hustle"
  | "magnates-mystery"
  | "typewriter-vibe"
  | "dark-psychology"
  | "karaoke"
  | "minimal"
  | "bounce"
  | "classic"
  | "ali-abdaal"
  | "vox"
  | "luxury"
  | "cyberpunk"
  | "cinema-noir"
  | "terminal"
  | "creator-pop"
  | "warm-pastel"
  | "urban-rebel"
  | "nordic-clean"
  | "kapwing-viral"
  | "neon-cyber"
  | "retro-glitch"
  | "cinema-gold"
  | "tiktok-hype";

export type AnimationType = "highlight" | "karaoke" | "scale" | "bounce" | "pop" | "glow" | "box";

export type CaptionCategory = "all" | "trending" | "clean-tech" | "editorial-film" | "pop-expressive";

export type FontWeightOption = "default" | "light" | "regular" | "medium" | "bold" | "extra-bold";
export type WeightTransitionOption = "none" | "light-to-bold" | "bold-to-light";
export type FontStyleOption = "default" | "normal" | "italic";
export type TextCasingOption = "default" | "uppercase" | "title" | "original";

export interface FontOption {
  name: string;
  family: string;
  category: "sans" | "serif" | "mono" | "display";
  popularIn: string;
}

export const TOP_CAPTION_FONTS: FontOption[] = [
  { name: "Inter", family: "Inter", category: "sans", popularIn: "Ali Abdaal, Tech, Productivity" },
  { name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", category: "sans", popularIn: "DOAC Podcast, Modern Brands" },
  { name: "Montserrat", family: "Montserrat", category: "sans", popularIn: "Alex Hormozi, Business Reels" },
  { name: "Bebas Neue", family: "Bebas Neue", category: "display", popularIn: "MrBeast, High Energy" },
  { name: "Syne", family: "Syne", category: "sans", popularIn: "Vox, Video Essays, Journalism" },
  { name: "Playfair Display", family: "Playfair Display", category: "serif", popularIn: "Iman Gadzhi, Luxury, Finance" },
  { name: "Cinzel", family: "Cinzel", category: "serif", popularIn: "Magnates Media, Film, True Crime" },
  { name: "Poppins", family: "Poppins", category: "sans", popularIn: "Submagic, Creator Viral Shorts" },
  { name: "Outfit", family: "Outfit", category: "sans", popularIn: "Lifestyle, Vlogs, Modern Aesthetic" },
  { name: "JetBrains Mono", family: "JetBrains Mono", category: "mono", popularIn: "Devs, Coding, Technical" },
  { name: "Orbitron", family: "Orbitron", category: "display", popularIn: "Cyberpunk, Gaming, Dark Stoic" },
  { name: "Rubik", family: "Rubik", category: "sans", popularIn: "Viral TikTok, Punchy Sans" },
  { name: "Space Grotesk", family: "Space Grotesk", category: "display", popularIn: "Modern Editorial, Tech Shorts" },
  { name: "Anton", family: "Anton", category: "display", popularIn: "TikTok Viral, Bold Attention" },
  { name: "Permanent Marker", family: "Permanent Marker", category: "display", popularIn: "Fitness, Street Sports" },
];

export type CaptionJobStatus = "pending" | "uploading" | "processing" | "completed" | "failed";
export type CaptionPhase = "uploading" | "transcribing" | "burning" | "finalizing";

export interface CaptionStyleConfig {
  id: CaptionStyle;
  name: string;
  category?: string;
  description: string;
  fontName: string;
  fontNameFallback: string;
  fontSize: number;
  primaryColor: string;
  highlightColor: string;
  outlineColor: string;
  backgroundColor?: string;
  shadowColor: string;
  shadowAlpha: number;
  outlineSize: number;
  shadowDepth: number;
  bold: boolean;
  italic: boolean;
  letterSpacing: number;
  wordSpacing: number;
  animationType: AnimationType;
  previewText: string;
  bestFor: string;
  previewFontSize: number;
  previewOutlineSize: number;
  previewShadowDepth: number;
  previewLetterSpacing: number;
}

export interface CaptionJob {
  id: string;
  displayName: string | null;
  originalFileName: string;
  fileSize: number;
  durationSeconds: number | null;
  captionStyle: CaptionStyle;
  captionPosition: number;
  customFont: string | null;
  fontWeight: string | null;
  weightTransition: string | null;
  fontStyle?: FontStyleOption | null;
  textCasing?: TextCasingOption | null;
  primaryColor?: string | null;
  highlightColor?: string | null;
  outlineColor?: string | null;
  backgroundColor?: string | null;
  status: CaptionJobStatus;
  progress: number;
  currentPhase: CaptionPhase | null;
  language: string | null;
  errorMessage: string | null;
  backendJobId: string | null;
  processingTimeMs: number | null;
  outputFileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendStatusResponse {
  jobId: string;
  status: string;
  progress: number;
  currentPhase: string | null;
  language: string | null;
  durationSeconds: number | null;
  errorMessage: string | null;
  processingTimeMs: number | null;
  transcript?: TranscriptData | null;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptSegment {
  id?: string;
  start: number;
  end: number;
  text: string;
  words: WordTimestamp[];
}

export interface TranscriptData {
  language: string;
  segments: TranscriptSegment[];
}

export type ExportFormat = "srt" | "vtt" | "txt" | "ass";

export interface RerenderJobRequest {
  transcript: TranscriptData;
  captionStyle: CaptionStyle;
  captionPosition: number;
  customFont?: string | null;
  fontWeight?: string | null;
  weightTransition?: string | null;
  fontStyle?: FontStyleOption | null;
  textCasing?: TextCasingOption | null;
  primaryColor?: string | null;
  highlightColor?: string | null;
  outlineColor?: string | null;
  backgroundColor?: string | null;
}

