import configJson from "./caption-styles.config.json";
import type { CaptionStyle, CaptionStyleConfig } from "~/types/caption";

const PREVIEW_PHONE_WIDTH = 180;
const REFERENCE_VIDEO_WIDTH = 1080;
const PREVIEW_SCALE = PREVIEW_PHONE_WIDTH / REFERENCE_VIDEO_WIDTH;

function buildStyleConfigs(): Record<CaptionStyle, CaptionStyleConfig> {
  const styles = configJson.styles as Record<string, Record<string, unknown>>;
  const result: Record<string, CaptionStyleConfig> = {};

  for (const [id, raw] of Object.entries(styles)) {
    const fontSize = raw.fontSize as number;
    const outlineSize = raw.outlineSize as number;
    const shadowDepth = raw.shadowDepth as number;
    const letterSpacing = raw.letterSpacing as number;

    result[id] = {
      ...(raw as unknown as CaptionStyleConfig),
      previewFontSize: Math.round(fontSize * PREVIEW_SCALE * 10) / 10,
      previewOutlineSize: Math.round(outlineSize * PREVIEW_SCALE * 10) / 10,
      previewShadowDepth: Math.round(shadowDepth * PREVIEW_SCALE * 10) / 10,
      previewLetterSpacing: Math.round(letterSpacing * PREVIEW_SCALE * 10) / 10,
    };
  }

  return result as Record<CaptionStyle, CaptionStyleConfig>;
}

export const CAPTION_STYLES: CaptionStyle[] = [
  "hormozi",
  "mrbeast",
  "crimson-pop",
  "podcast-hook",
  "wealth-hustle",
  "magnates-mystery",
  "typewriter-vibe",
  "dark-psychology",
  "classic",
  "ali-abdaal",
  "vox",
  "luxury",
  "cyberpunk",
  "cinema-noir",
  "terminal",
  "creator-pop",
  "warm-pastel",
  "urban-rebel",
  "nordic-clean",
  "kapwing-viral",
  "neon-cyber",
  "retro-glitch",
  "cinema-gold",
  "tiktok-hype",
  "karaoke",
  "minimal",
  "bounce",
];

export const CAPTION_STYLE_CONFIGS = buildStyleConfigs();

export const DEFAULT_CAPTION_STYLE: CaptionStyle = "hormozi";
export const DEFAULT_CAPTION_POSITION = 10;

export const CAPTION_POSITION_MIN = 5;
export const CAPTION_POSITION_MAX = 50;
