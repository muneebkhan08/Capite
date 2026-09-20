"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Copy,
  Check,
  Plus,
  Trash2,
  Split,
  Combine,
  Clock,
  X,
  Volume2,
} from "lucide-react";
import type { TranscriptData, TranscriptSegment, WordTimestamp } from "~/types/caption";

interface TranscriptEditorProps {
  transcript: TranscriptData;
  currentTime: number;
  activeSegmentIndex: number;
  onSeek: (seconds: number) => void;
  onChangeTranscript: (newTranscript: TranscriptData) => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toFixed(2).padStart(5, "0")}`;
}

export function TranscriptEditor({
  transcript,
  currentTime,
  activeSegmentIndex,
  onSeek,
  onChangeTranscript,
  autoScroll,
  onToggleAutoScroll,
}: TranscriptEditorProps) {
  const [copied, setCopied] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [editingWordInfo, setEditingWordInfo] = useState<{
    segmentIndex: number;
    wordIndex: number;
    value: string;
  } | null>(null);
  const [editingSegmentTextIndex, setEditingSegmentTextIndex] = useState<number | null>(null);

  const activeSegmentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active segment when playing
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && containerRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeSegmentIndex, autoScroll]);

  // Copy plain transcript
  const handleCopyTranscript = async () => {
    const text = transcript.segments.map((s) => s.text).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find matches count
  const findMatchesCount = findQuery.trim()
    ? transcript.segments.reduce((acc, seg) => {
        const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const matches = seg.text.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0)
    : 0;

  // Replace Next
  const handleReplaceNext = () => {
    if (!findQuery.trim()) return;
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    let replaced = false;
    const newSegments = transcript.segments.map((seg) => {
      if (replaced || !regex.test(seg.text)) return seg;
      replaced = true;
      const newText = seg.text.replace(regex, replaceQuery);
      // Re-align words
      const words = recomputeWordsFromText(newText, seg.start, seg.end);
      onSeek(seg.start);
      return { ...seg, text: newText, words };
    });

    if (replaced) {
      onChangeTranscript({ ...transcript, segments: newSegments });
    }
  };

  // Replace All
  const handleReplaceAll = () => {
    if (!findQuery.trim()) return;
    const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

    const newSegments = transcript.segments.map((seg) => {
      if (!regex.test(seg.text)) return seg;
      const newText = seg.text.replace(regex, replaceQuery);
      const words = recomputeWordsFromText(newText, seg.start, seg.end);
      return { ...seg, text: newText, words };
    });

    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Casing transformations
  const handleTransformCasing = (casing: "uppercase" | "title" | "lowercase" | "sentence") => {
    const newSegments = transcript.segments.map((seg) => {
      let newText = seg.text;
      if (casing === "uppercase") {
        newText = seg.text.toUpperCase();
      } else if (casing === "lowercase") {
        newText = seg.text.toLowerCase();
      } else if (casing === "title") {
        newText = seg.text.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      } else if (casing === "sentence") {
        newText = seg.text.charAt(0).toUpperCase() + seg.text.slice(1).toLowerCase();
      }

      const newWords = seg.words.map((w) => {
        let wordText = w.word;
        if (casing === "uppercase") wordText = w.word.toUpperCase();
        else if (casing === "lowercase") wordText = w.word.toLowerCase();
        else if (casing === "title") wordText = w.word.charAt(0).toUpperCase() + w.word.slice(1).toLowerCase();
        return { ...w, word: wordText };
      });

      return { ...seg, text: newText, words: newWords };
    });

    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Helper to recompute words evenly if segment text changed
  const recomputeWordsFromText = (
    text: string,
    segStart: number,
    segEnd: number
  ): WordTimestamp[] => {
    const tokens = text.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const totalDuration = Math.max(0.1, segEnd - segStart);
    const wordDuration = totalDuration / tokens.length;

    return tokens.map((token, idx) => ({
      word: token,
      start: segStart + idx * wordDuration,
      end: segStart + (idx + 1) * wordDuration,
    }));
  };

  // Update specific word
  const handleSaveWordEdit = (segmentIndex: number, wordIndex: number, newWordValue: string) => {
    const cleaned = newWordValue.trim();
    if (!cleaned) {
      setEditingWordInfo(null);
      return;
    }

    const newSegments = [...transcript.segments];
    const seg = { ...newSegments[segmentIndex] };
    const words = [...seg.words];
    words[wordIndex] = { ...words[wordIndex], word: cleaned };
    seg.words = words;
    seg.text = words.map((w) => w.word).join(" ");
    newSegments[segmentIndex] = seg;

    onChangeTranscript({ ...transcript, segments: newSegments });
    setEditingWordInfo(null);
  };

  // Save segment text edit
  const handleSaveSegmentText = (segmentIndex: number, newText: string) => {
    const newSegments = [...transcript.segments];
    const seg = { ...newSegments[segmentIndex] };
    seg.text = newText.trim();
    seg.words = recomputeWordsFromText(seg.text, seg.start, seg.end);
    newSegments[segmentIndex] = seg;

    onChangeTranscript({ ...transcript, segments: newSegments });
    setEditingSegmentTextIndex(null);
  };

  // Add subtitle segment
  const handleAddSegment = () => {
    const start = Math.max(0, currentTime);
    const end = start + 2.5;
    const newSegment: TranscriptSegment = {
      start,
      end,
      text: "New subtitle line",
      words: [
        { word: "New", start, end: start + 0.8 },
        { word: "subtitle", start: start + 0.8, end: start + 1.6 },
        { word: "line", start: start + 1.6, end },
      ],
    };

    const newSegments = [...transcript.segments, newSegment].sort((a, b) => a.start - b.start);
    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Delete segment
  const handleDeleteSegment = (index: number) => {
    const newSegments = transcript.segments.filter((_, i) => i !== index);
    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Split segment
  const handleSplitSegment = (index: number) => {
    const seg = transcript.segments[index];
    if (!seg.words.length || seg.words.length < 2) return;
    const mid = Math.floor(seg.words.length / 2);
    const firstWords = seg.words.slice(0, mid);
    const secondWords = seg.words.slice(mid);

    const firstSeg: TranscriptSegment = {
      start: seg.start,
      end: firstWords[firstWords.length - 1].end,
      text: firstWords.map((w) => w.word).join(" "),
      words: firstWords,
    };

    const secondSeg: TranscriptSegment = {
      start: secondWords[0].start,
      end: seg.end,
      text: secondWords.map((w) => w.word).join(" "),
      words: secondWords,
    };

    const newSegments = [
      ...transcript.segments.slice(0, index),
      firstSeg,
      secondSeg,
      ...transcript.segments.slice(index + 1),
    ];
    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Merge segment with next
  const handleMergeSegment = (index: number) => {
    if (index >= transcript.segments.length - 1) return;
    const cur = transcript.segments[index];
    const next = transcript.segments[index + 1];

    const mergedSeg: TranscriptSegment = {
      start: cur.start,
      end: next.end,
      text: `${cur.text} ${next.text}`.trim(),
      words: [...cur.words, ...next.words],
    };

    const newSegments = [
      ...transcript.segments.slice(0, index),
      mergedSeg,
      ...transcript.segments.slice(index + 2),
    ];
    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Nudge timing
  const handleNudgeTime = (index: number, delta: number, edge: "start" | "end") => {
    const newSegments = [...transcript.segments];
    const seg = { ...newSegments[index] };
    if (edge === "start") {
      seg.start = Math.max(0, Math.min(seg.end - 0.2, seg.start + delta));
    } else {
      seg.end = Math.max(seg.start + 0.2, seg.end + delta);
    }
    newSegments[index] = seg;
    onChangeTranscript({ ...transcript, segments: newSegments });
  };

  // Total word count
  const totalWords = transcript.segments.reduce((acc, s) => acc + (s.words?.length || s.text.split(/\s+/).length), 0);

  return (
    <div className="flex h-full flex-col">
      {/* Action Toolbar */}
      <div className="border-b border-line bg-surface-2/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left tools: Find & Replace + Casing */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showFindReplace
                  ? "border-brand bg-brand/10 text-brand dark:bg-brand/20"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
              title="Find and replace words in transcript"
            >
              <Search className="h-3.5 w-3.5" />
              Find & Replace
            </button>

            {/* Casing tools */}
            <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
              <button
                onClick={() => handleTransformCasing("uppercase")}
                className="rounded px-2 py-1 text-[11px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
                title="Convert all text to UPPERCASE (TikTok style)"
              >
                AA
              </button>
              <button
                onClick={() => handleTransformCasing("title")}
                className="rounded px-2 py-1 text-[11px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
                title="Convert all text to Title Case"
              >
                Aa
              </button>
              <button
                onClick={() => handleTransformCasing("lowercase")}
                className="rounded px-2 py-1 text-[11px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
                title="Convert all text to lowercase"
              >
                aa
              </button>
            </div>
          </div>

          {/* Right tools: Copy, Auto-scroll, Add Subtitle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleAutoScroll}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                autoScroll
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
              }`}
              title="Auto-scroll transcript as video plays"
            >
              Auto-scroll
            </button>

            <button
              onClick={() => void handleCopyTranscript()}
              className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              title="Copy entire transcript text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-moss-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={handleAddSegment}
              className="flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-medium text-brand-ink transition-colors hover:bg-brand-hover"
              title="Add a new subtitle segment at current playhead"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Find & Replace Bar */}
        {showFindReplace && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-2.5 shadow-sm">
            <div className="flex flex-1 items-center gap-1.5">
              <input
                type="text"
                placeholder="Find in transcript..."
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                className="w-full rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink outline-none transition-colors focus:border-brand"
              />
              <span className="text-[11px] font-medium whitespace-nowrap text-ink-subtle">
                {findMatchesCount} {findMatchesCount === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="flex flex-1 items-center gap-1.5">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="w-full rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink outline-none transition-colors focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReplaceNext}
                disabled={!findQuery.trim() || findMatchesCount === 0}
                className="rounded-md bg-surface-3 px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-line-strong disabled:opacity-40"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={!findQuery.trim() || findMatchesCount === 0}
                className="rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-brand-ink transition-colors hover:bg-brand-hover disabled:opacity-40"
              >
                Replace All
              </button>
              <button
                onClick={() => setShowFindReplace(false)}
                className="rounded p-1 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Segments List */}
      <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "calc(70vh - 120px)" }}>
        {transcript.segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-2 h-8 w-8 text-ink-faint" />
            <p className="text-sm font-medium text-ink-muted">No captions transcribed</p>
            <p className="text-xs text-ink-faint">Click &quot;Add Subtitle&quot; to create your first line.</p>
          </div>
        ) : (
          transcript.segments.map((seg, sIdx) => {
            const isActive = sIdx === activeSegmentIndex;

            return (
              <div
                key={sIdx}
                ref={isActive ? activeSegmentRef : null}
                className={`group relative rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? "border-brand bg-brand/5 shadow-sm ring-2 ring-brand/20 dark:bg-brand/10 dark:ring-brand/30"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                }`}
              >
                {/* Header: Timestamp chip & Actions */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onSeek(seg.start)}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-medium transition-colors ${
                        isActive
                          ? "bg-brand text-brand-ink"
                          : "bg-surface-2 text-ink-muted hover:bg-surface-3 hover:text-ink"
                      }`}
                      title="Click to jump playback here"
                    >
                      <Clock className="h-3 w-3" />
                      {formatTime(seg.start)} - {formatTime(seg.end)}
                    </button>

                    <span className="numeric text-[10px] text-ink-faint">
                      {(seg.end - seg.start).toFixed(1)}s
                    </span>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-wash px-2 py-0.5 text-[10px] font-semibold text-brand">
                        <Volume2 className="h-2.5 w-2.5 animate-pulse" />
                        Speaking
                      </span>
                    )}
                  </div>

                  {/* Segment action icons */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                    {/* Nudge timing */}
                    <button
                      onClick={() => handleNudgeTime(sIdx, -0.1, "start")}
                      className="rounded px-1 text-[10px] font-mono text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                      title="Nudge start time -0.1s"
                    >
                      -0.1s
                    </button>
                    <button
                      onClick={() => handleNudgeTime(sIdx, 0.1, "end")}
                      className="rounded px-1 text-[10px] font-mono text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                      title="Nudge end time +0.1s"
                    >
                      +0.1s
                    </button>

                    {/* Split */}
                    <button
                      onClick={() => handleSplitSegment(sIdx)}
                      disabled={seg.words.length < 2}
                      className="rounded p-1 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                      title="Split this subtitle into two segments"
                    >
                      <Split className="h-3.5 w-3.5" />
                    </button>

                    {/* Merge */}
                    {sIdx < transcript.segments.length - 1 && (
                      <button
                        onClick={() => handleMergeSegment(sIdx)}
                        className="rounded p-1 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                        title="Merge with next subtitle segment"
                      >
                        <Combine className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteSegment(sIdx)}
                      className="rounded p-1 text-gray-400 hover:bg-brick-50 hover:text-brick-500 dark:hover:bg-brick-400/15 dark:hover:text-brick-200/50"
                      title="Delete this subtitle"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content: Inline Word Editing or Full Text Mode */}
                {editingSegmentTextIndex === sIdx ? (
                  <div className="mt-1">
                    <textarea
                      defaultValue={seg.text}
                      rows={2}
                      autoFocus
                      onBlur={(e) => handleSaveSegmentText(sIdx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveSegmentText(sIdx, e.currentTarget.value);
                        }
                      }}
                      className="w-full rounded-lg border border-brand bg-white p-2 text-sm text-gray-900 outline-none dark:bg-gray-950 dark:text-white"
                    />
                    <p className="numeric text-[10px] text-ink-faint">Press Enter or click outside to save</p>
                  </div>
                ) : (
                  <div>
                    {/* Word-by-word interactive pill list */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {seg.words && seg.words.length > 0 ? (
                        seg.words.map((w, wIdx) => {
                          const isWordActive =
                            isActive && currentTime >= w.start && currentTime <= w.end;
                          const isEditingThisWord =
                            editingWordInfo?.segmentIndex === sIdx && editingWordInfo?.wordIndex === wIdx;

                          if (isEditingThisWord) {
                            return (
                              <input
                                key={wIdx}
                                type="text"
                                autoFocus
                                value={editingWordInfo.value}
                                onChange={(e) =>
                                  setEditingWordInfo({ ...editingWordInfo, value: e.target.value })
                                }
                                onBlur={() => handleSaveWordEdit(sIdx, wIdx, editingWordInfo.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveWordEdit(sIdx, wIdx, editingWordInfo.value);
                                  } else if (e.key === "Escape") {
                                    setEditingWordInfo(null);
                                  }
                                }}
                                className="h-6 w-20 rounded border border-brand bg-white px-1.5 text-xs text-gray-900 shadow-sm outline-none dark:bg-gray-950 dark:text-white"
                              />
                            );
                          }

                          return (
                            <button
                              key={wIdx}
                              onClick={() =>
                                setEditingWordInfo({
                                  segmentIndex: sIdx,
                                  wordIndex: wIdx,
                                  value: w.word,
                                })
                              }
                              className={`group/word relative cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium transition-all ${
                                isWordActive
                                  ? "bg-brand text-white shadow-sm"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-950 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                              }`}
                              title={`Click to edit spelling. Time: ${w.start.toFixed(2)}s - ${w.end.toFixed(2)}s`}
                            >
                              {w.word}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-xs text-ink-muted">{seg.text}</span>
                      )}

                      {/* Quick toggle to edit whole segment text */}
                      <button
                        onClick={() => setEditingSegmentTextIndex(sIdx)}
                        className="ml-auto text-[11px] text-gray-400 underline-offset-2 hover:text-brand hover:underline"
                        title="Edit whole line as plain text"
                      >
                        Edit line
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats bar */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/75 px-4 py-2.5 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
        <div>
          <span>{transcript.segments.length} segments</span>
          <span className="mx-1.5">•</span>
          <span>{totalWords} words</span>
          <span className="mx-1.5">•</span>
          <span className="capitalize">{transcript.language || "en"}</span>
        </div>
        <div className="text-[11px] text-gray-400">
          Click any word to fix spelling & typos
        </div>
      </div>
    </div>
  );
}
