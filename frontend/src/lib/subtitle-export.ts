import type { TranscriptData } from "~/types/caption";

function formatTimestamp(seconds: number, decimalSep: string = ","): string {
  if (seconds < 0) seconds = 0;
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const hours = Math.floor(totalMin / 60);

  const hh = hours.toString().padStart(2, "0");
  const mm = min.toString().padStart(2, "0");
  const ss = sec.toString().padStart(2, "0");
  const mmm = ms.toString().padStart(3, "0");
  return `${hh}:${mm}:${ss}${decimalSep}${mmm}`;
}

export function transcriptToSrt(transcript: TranscriptData): string {
  const lines: string[] = [];
  let index = 1;
  for (const seg of transcript.segments) {
    let text = (seg.text || "").trim();
    if (!text && seg.words?.length) {
      text = seg.words
        .map((w) => w.word.trim())
        .filter(Boolean)
        .join(" ");
    }
    if (!text) continue;

    const startTs = formatTimestamp(seg.start, ",");
    const endTs = formatTimestamp(seg.end, ",");
    lines.push(`${index}\n${startTs} --> ${endTs}\n${text}\n`);
    index++;
  }
  return lines.join("\n").trim() + "\n";
}

export function transcriptToVtt(transcript: TranscriptData): string {
  const lines: string[] = ["WEBVTT\n"];
  let index = 1;
  for (const seg of transcript.segments) {
    let text = (seg.text || "").trim();
    if (!text && seg.words?.length) {
      text = seg.words
        .map((w) => w.word.trim())
        .filter(Boolean)
        .join(" ");
    }
    if (!text) continue;

    const startTs = formatTimestamp(seg.start, ".");
    const endTs = formatTimestamp(seg.end, ".");
    lines.push(`${index}\n${startTs} --> ${endTs}\n${text}\n`);
    index++;
  }
  return lines.join("\n").trim() + "\n";
}

export function transcriptToTxt(transcript: TranscriptData): string {
  return transcript.segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
