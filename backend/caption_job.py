"""Caption job processing pipeline.

Runs the full video captioning workflow:
  1. Probe video for dimensions and duration (ffprobe)
  2. Transcribe audio with word-level timestamps (faster-whisper)
  3. Generate ASS subtitle file
  4. Burn subtitles into video (ffmpeg)
  5. Clean up temp files and mark job completed
"""

import json
import logging
import os
import shutil
import subprocess
import time

logger = logging.getLogger(__name__)

# Default Whisper model size; override via env var to trade speed vs accuracy.
_WHISPER_MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "base")


# ---------------------------------------------------------------------------
# Low-level helpers (each independently mockable)
# ---------------------------------------------------------------------------

def probe_video(video_path: str) -> tuple[int, int, float]:
    """Return (width, height, duration_seconds) for *video_path* via ffprobe.

    Raises:
        RuntimeError: if ffprobe is not installed or returns a non-zero exit code.
        ValueError: if the probe output cannot be parsed.
    """
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_streams",
        video_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    except FileNotFoundError as exc:
        raise RuntimeError("ffprobe not found; please install ffmpeg") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"ffprobe failed: {exc.stderr.strip()}") from exc

    data = json.loads(result.stdout)
    video_stream = next(
        (s for s in data.get("streams", []) if s.get("codec_type") == "video"),
        None,
    )
    if video_stream is None:
        raise ValueError(f"No video stream found in {video_path!r}")

    width = int(video_stream["width"])
    height = int(video_stream["height"])

    # Duration may live on the stream or the container (format) level.
    duration_str = video_stream.get("duration") or data.get("format", {}).get("duration")
    if duration_str is None:
        raise ValueError(f"Could not determine duration of {video_path!r}")
    duration = float(duration_str)

    return width, height, duration


def transcribe_audio(video_path: str) -> dict:
    """Transcribe *video_path* using faster-whisper with word-level timestamps.

    Returns a dict with keys:
        language  (str)   – detected language code, e.g. "en"
        segments  (list)  – list of segment dicts, each containing:
            start, end, text, words (list of word dicts with start/end/word)

    The model size is controlled by the ``WHISPER_MODEL_SIZE`` environment
    variable (default: "base").
    """
    # Import here so tests can mock at the module level without importing
    # faster-whisper at module load time (it is a heavy optional dependency).
    from faster_whisper import WhisperModel  # type: ignore[import]

    model = WhisperModel(_WHISPER_MODEL_SIZE, compute_type="int8")
    segments_iter, info = model.transcribe(video_path, word_timestamps=True)

    segments = []
    for seg in segments_iter:
        words = []
        for w in (seg.words or []):
            words.append({"word": w.word, "start": w.start, "end": w.end})
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip(),
            "words": words,
        })

    return {
        "language": info.language,
        "segments": segments,
    }


def generate_ass_from_transcript(
    transcript: dict,
    duration: float,
    output_path: str,
    caption_style: str,
    caption_position: int,
    language: str,
    video_width: int,
    video_height: int,
    custom_font: str | None = None,
    font_weight: str | None = None,
    weight_transition: str = "none",
    primary_color: str | None = None,
    highlight_color: str | None = None,
    outline_color: str | None = None,
    background_color: str | None = None,
    font_style: str | None = None,
    text_casing: str | None = None,
) -> bool:
    """Generate an ASS subtitle file from a transcript dict.

    This is a thin wrapper around ``subtitles.generate_ass()``.
    Returns True on success.
    """
    import subtitles

    return subtitles.generate_ass(
        transcript,
        0,
        duration,
        output_path,
        caption_style=caption_style,
        caption_position=caption_position,
        language=language,
        video_width=video_width,
        video_height=video_height,
        custom_font=custom_font,
        font_weight=font_weight,
        weight_transition=weight_transition,
        primary_color=primary_color,
        highlight_color=highlight_color,
        outline_color=outline_color,
        background_color=background_color,
        font_style=font_style,
        text_casing=text_casing,
    )


def _escape_ffmpeg_filter_path(path: str) -> str:
    """Escape a file path for use inside an ffmpeg filter-graph expression.

    FFmpeg's filter-graph parser treats ``\\``, ``'``, ``:``, ``;``, ``[``,
    ``]``, and ``,`` as metacharacters.  Each must be backslash-escaped so
    the literal path is preserved.
    """
    for ch in ("\\", "'", ":", ";", "[", "]", ","):
        path = path.replace(ch, f"\\{ch}")
    return path


def _check_ass_filter_available() -> None:
    """Raise ``RuntimeError`` if ffmpeg was built without the *ass* filter.

    This typically happens when the Homebrew ffmpeg formula does not link
    against **libass** (``--enable-libass``).
    """
    try:
        result = subprocess.run(
            ["ffmpeg", "-hide_banner", "-h", "filter=ass"],
            capture_output=True, text=True, check=False,
        )
        if "Unknown filter" in result.stdout or "Unknown filter" in result.stderr:
            raise RuntimeError(
                "ffmpeg was built without libass support — the 'ass' subtitle "
                "filter is unavailable.  On macOS run:\n"
                "  brew reinstall ffmpeg --with-libass   # or\n"
                "  brew tap homebrew-ffmpeg/ffmpeg && "
                "brew install homebrew-ffmpeg/ffmpeg/ffmpeg --with-libass\n"
                "to rebuild ffmpeg with subtitle burn-in support."
            )
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg not found; please install ffmpeg") from exc


def burn_subtitles(video_path: str, ass_path: str, output_path: str) -> bool:
    """Burn ASS subtitles into *video_path* and write to *output_path*.

    Uses libx264 with veryfast preset and CRF 18 for high quality output.
    Audio is stream-copied without re-encoding.

    Returns True on success.

    Raises:
        RuntimeError: if ffmpeg is not installed, lacks libass, or returns a
                      non-zero exit code.
    """
    _check_ass_filter_available()

    escaped_ass = _escape_ffmpeg_filter_path(ass_path)
    cmd = [
        "ffmpeg",
        "-y",
        "-i", video_path,
        "-vf", f"ass='{escaped_ass}'",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "copy",
        output_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg not found; please install ffmpeg") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"ffmpeg failed: {exc.stderr[-500:]}") from exc

    _ = result  # success
    return True


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def process_caption_job(
    storage,
    job_id: str,
    video_path: str,
    caption_style: str,
    caption_position: int,
    data_dir: str,
    custom_font: str | None = None,
    font_weight: str | None = None,
    weight_transition: str = "none",
    primary_color: str | None = None,
    highlight_color: str | None = None,
    outline_color: str | None = None,
    background_color: str | None = None,
    font_style: str | None = None,
    text_casing: str | None = None,
) -> None:
    """Run the full captioning pipeline for a job.

    Progress milestones:
        5   – job started, probing video
        40  – transcription complete
        50  – ASS file generated
        90  – subtitles burned into video
        100 – completed

    All exceptions are caught; on failure the job is marked "failed" with the
    exception message stored in ``error_message``.
    """
    # Derived paths
    ass_path = os.path.join(data_dir, "temp", job_id, "subtitles.ass")
    output_dir = os.path.join(data_dir, "output", job_id)
    output_path = os.path.join(output_dir, "captioned.mp4")

    start_time = time.time()

    try:
        # ------------------------------------------------------------------
        # Phase 1: probe
        # ------------------------------------------------------------------
        storage.update_status(
            job_id,
            status="processing",
            phase="transcribing",
            progress=5,
        )

        width, height, duration = probe_video(video_path)
        storage.update_status(job_id, duration=duration)

        # ------------------------------------------------------------------
        # Phase 2: transcribe
        # ------------------------------------------------------------------
        transcript = transcribe_audio(video_path)
        language = transcript.get("language", "en")
        storage.update_status(job_id, language=language, progress=40, transcript=transcript)

        # Persist transcript in output dir
        os.makedirs(output_dir, exist_ok=True)
        transcript_json_path = os.path.join(output_dir, "transcript.json")
        try:
            with open(transcript_json_path, "w", encoding="utf-8") as fh:
                json.dump(transcript, fh, indent=2, ensure_ascii=False)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not write transcript.json: %s", exc)

        # ------------------------------------------------------------------
        # Phase 3: generate ASS
        # ------------------------------------------------------------------
        storage.update_status(job_id, phase="burning", progress=50)

        os.makedirs(os.path.dirname(ass_path), exist_ok=True)
        generate_ass_from_transcript(
            transcript=transcript,
            duration=duration,
            output_path=ass_path,
            caption_style=caption_style,
            caption_position=caption_position,
            language=language,
            video_width=width,
            video_height=height,
            custom_font=custom_font,
            font_weight=font_weight,
            weight_transition=weight_transition,
            primary_color=primary_color,
            highlight_color=highlight_color,
            outline_color=outline_color,
            background_color=background_color,
            font_style=font_style,
            text_casing=text_casing,
        )

        # Also persist ASS file in output dir for downloading/exporting
        permanent_ass_path = os.path.join(output_dir, "subtitles.ass")
        try:
            shutil.copyfile(ass_path, permanent_ass_path)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not copy subtitles.ass to output dir: %s", exc)

        # ------------------------------------------------------------------
        # Phase 4: burn subtitles
        # ------------------------------------------------------------------
        storage.update_status(job_id, phase="finalizing", progress=90)

        burn_subtitles(video_path, ass_path, output_path)

        # ------------------------------------------------------------------
        # Phase 5: clean up temp files and finalise
        # ------------------------------------------------------------------
        temp_job_dir = os.path.join(data_dir, "temp", job_id)
        if os.path.isdir(temp_job_dir):
            shutil.rmtree(temp_job_dir, ignore_errors=True)

        storage.update_status(
            job_id,
            status="completed",
            progress=100,
            output_path=output_path,
            processing_time_ms=int((time.time() - start_time) * 1000),
        )

    except Exception as exc:  # noqa: BLE001
        logger.exception("Job %s failed: %s", job_id, exc)
        storage.update_status(job_id, status="failed", error=str(exc))


def rerender_caption_job(
    storage,
    job_id: str,
    data_dir: str,
    *,
    transcript: dict | None = None,
    caption_style: str | None = None,
    caption_position: int | None = None,
    custom_font: str | None = None,
    font_weight: str | None = None,
    weight_transition: str | None = None,
    primary_color: str | None = None,
    highlight_color: str | None = None,
    outline_color: str | None = None,
    background_color: str | None = None,
    font_style: str | None = None,
    text_casing: str | None = None,
) -> bool:
    """Re-render an existing job's video with updated transcript and/or styles."""
    job = storage.get_job(job_id)
    if not job:
        raise ValueError(f"Job {job_id} not found")

    video_path = job.get("video_path")
    if not video_path or not os.path.isfile(video_path):
        raise FileNotFoundError(f"Source video {video_path} not found")

    start_time = time.time()
    storage.update_status(job_id, status="processing", phase="burning", progress=50)

    # Use updated transcript or existing
    if transcript is None:
        transcript = job.get("transcript")
    if transcript is None:
        # Try loading from output directory
        transcript_path = os.path.join(data_dir, "output", job_id, "transcript.json")
        if os.path.isfile(transcript_path):
            with open(transcript_path, "r", encoding="utf-8") as fh:
                transcript = json.load(fh)

    if not transcript:
        raise ValueError("No transcript available to re-render")

    # Resolve settings with fallbacks to existing job settings
    final_style = caption_style or job.get("caption_style", "hormozi")
    final_position = caption_position if caption_position is not None else job.get("caption_position", 10)
    final_font = custom_font if custom_font is not None else job.get("custom_font")
    final_font_weight = font_weight if font_weight is not None else job.get("font_weight")
    final_weight_trans = weight_transition if weight_transition is not None else job.get("weight_transition", "none")
    final_primary = primary_color if primary_color is not None else job.get("primary_color")
    final_highlight = highlight_color if highlight_color is not None else job.get("highlight_color")
    final_outline = outline_color if outline_color is not None else job.get("outline_color")
    final_bg = background_color if background_color is not None else job.get("background_color")
    final_font_style = font_style if font_style is not None else job.get("font_style")
    final_casing = text_casing if text_casing is not None else job.get("text_casing")

    # Probe video for dimensions & duration
    width, height, duration = probe_video(video_path)

    output_dir = os.path.join(data_dir, "output", job_id)
    os.makedirs(output_dir, exist_ok=True)
    ass_path = os.path.join(output_dir, "subtitles.ass")
    output_path = os.path.join(output_dir, "captioned.mp4")
    transcript_json_path = os.path.join(output_dir, "transcript.json")

    # Write updated transcript.json
    with open(transcript_json_path, "w", encoding="utf-8") as fh:
        json.dump(transcript, fh, indent=2, ensure_ascii=False)

    language = transcript.get("language") or job.get("language", "en")

    # Generate ASS
    generate_ass_from_transcript(
        transcript=transcript,
        duration=duration,
        output_path=ass_path,
        caption_style=final_style,
        caption_position=final_position,
        language=language,
        video_width=width,
        video_height=height,
        custom_font=final_font,
        font_weight=final_font_weight,
        weight_transition=final_weight_trans,
        primary_color=final_primary,
        highlight_color=final_highlight,
        outline_color=final_outline,
        background_color=final_bg,
        font_style=final_font_style,
        text_casing=final_casing,
    )

    storage.update_status(job_id, phase="finalizing", progress=90)

    # Burn subtitles
    burn_subtitles(video_path, ass_path, output_path)

    # Update job fields in storage
    storage.update_job(
        job_id,
        caption_style=final_style,
        caption_position=final_position,
        custom_font=final_font,
        font_weight=final_font_weight,
        weight_transition=final_weight_trans,
        primary_color=final_primary,
        highlight_color=final_highlight,
        outline_color=final_outline,
        background_color=final_bg,
        font_style=final_font_style,
        text_casing=final_casing,
        transcript=transcript,
    )
    storage.update_status(
        job_id,
        status="completed",
        progress=100,
        output_path=output_path,
        processing_time_ms=int((time.time() - start_time) * 1000),
    )
    return True

