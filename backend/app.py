"""Flask API application for Capite AI Video Captions backend."""

import json
import os
import pathlib
import shutil
import tempfile
import threading
import time
import uuid

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS

from caption_styles import is_valid_caption_style
from job_storage import JobStorage

load_dotenv()

# Allowed video file extensions
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".webm"}

# Caption position valid range (inclusive)
CAPTION_POSITION_MIN = 5
CAPTION_POSITION_MAX = 50


def _extension_allowed(filename: str) -> bool:
    """Return True if the file's extension is in ALLOWED_EXTENSIONS."""
    return pathlib.Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def create_app(testing: bool = False) -> Flask:
    """Application factory.

    Args:
        testing: When True, skips background processing threads and uses an
                 in-memory-only (no-persist) JobStorage with a temp data dir.
    """
    app = Flask(__name__)

    # ------------------------------------------------------------------
    # Configuration
    # ------------------------------------------------------------------
    max_file_size_mb = int(os.environ.get("MAX_FILE_SIZE_MB", "500"))
    max_concurrent = int(os.environ.get("MAX_CONCURRENT_JOBS", "2"))
    max_duration_minutes = int(os.environ.get("MAX_DURATION_MINUTES", "30"))
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")

    app.config["TESTING"] = testing
    app.config["MAX_CONTENT_LENGTH"] = max_file_size_mb * 1024 * 1024
    app.config["MAX_FILE_SIZE_BYTES"] = max_file_size_mb * 1024 * 1024
    app.config["MAX_CONCURRENT"] = max_concurrent
    app.config["MAX_DURATION_MINUTES"] = max_duration_minutes

    if testing:
        data_dir = tempfile.mkdtemp()
        storage = JobStorage(persist_path=None)
    else:
        data_dir = os.environ.get("DATA_DIR", str(pathlib.Path(__file__).parent / "data"))
        persist_path = os.path.join(data_dir, "jobs.json")
        storage = JobStorage(persist_path=persist_path)

    app.config["STORAGE"] = storage
    app.config["DATA_DIR"] = data_dir

    # ------------------------------------------------------------------
    # Output TTL cleanup
    # ------------------------------------------------------------------
    if not testing:
        ttl_hours = int(os.environ.get("OUTPUT_TTL_HOURS", "24"))
        _schedule_cleanup(app, ttl_hours)

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS(app, origins=[frontend_url] if frontend_url != "*" else "*")

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "version": "1.0.0"})

    @app.post("/api/process")
    def process():
        storage: JobStorage = app.config["STORAGE"]
        data_dir: str = app.config["DATA_DIR"]
        max_file_size_bytes: int = app.config["MAX_FILE_SIZE_BYTES"]
        _max_duration_minutes: int = app.config["MAX_DURATION_MINUTES"]

        # --- Enforce concurrent job limit ---
        if storage.active_job_count() >= app.config["MAX_CONCURRENT"]:
            return jsonify({"error": "Too many concurrent jobs. Please wait."}), 429

        # --- Validate file presence ---
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if not file.filename:
            return jsonify({"error": "No file selected"}), 400

        # --- Validate file extension ---
        if not _extension_allowed(file.filename):
            ext = pathlib.Path(file.filename).suffix.lower()
            allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
            return jsonify({"error": f"Unsupported file type '{ext}'. Allowed: {allowed}"}), 400

        # --- Validate captionStyle ---
        caption_style = request.form.get("captionStyle", "")
        if not is_valid_caption_style(caption_style):
            return jsonify({"error": f"Invalid captionStyle '{caption_style}'"}), 400

        # --- Validate captionPosition ---
        caption_position_raw = request.form.get("captionPosition", "")
        try:
            caption_position = int(caption_position_raw)
        except (ValueError, TypeError):
            return jsonify({"error": "captionPosition must be an integer"}), 400

        if not (CAPTION_POSITION_MIN <= caption_position <= CAPTION_POSITION_MAX):
            return jsonify({
                "error": (
                    f"captionPosition must be between {CAPTION_POSITION_MIN} "
                    f"and {CAPTION_POSITION_MAX}"
                )
            }), 400

        # --- Validate durationSeconds (client-provided, from HTML5 video element) ---
        duration_seconds_str = request.form.get("durationSeconds")
        if duration_seconds_str:
            try:
                duration_seconds = float(duration_seconds_str)
                if duration_seconds > _max_duration_minutes * 60:
                    return jsonify({"error": f"Video too long. Maximum: {_max_duration_minutes} minutes"}), 400
            except ValueError:
                pass  # If unparseable, let it through — backend will determine during processing

        # --- Read file content and check size ---
        file_bytes = file.read()
        file_size = len(file_bytes)
        if file_size > max_file_size_bytes:
            return jsonify({"error": f"File exceeds maximum size of {max_file_size_bytes // (1024*1024)} MB"}), 400

        # --- Save file to temp location ---
        upload_dir = os.path.join(data_dir, "temp")
        os.makedirs(upload_dir, exist_ok=True)

        file_id = str(uuid.uuid4())
        ext = pathlib.Path(file.filename).suffix.lower()
        saved_filename = f"{file_id}{ext}"
        video_path = os.path.join(upload_dir, saved_filename)

        with open(video_path, "wb") as fh:
            fh.write(file_bytes)

        # --- Optional typography customizations ---
        custom_font = request.form.get("customFont") or None
        font_weight = request.form.get("fontWeight") or None
        weight_transition = request.form.get("weightTransition") or "none"
        font_style = request.form.get("fontStyle") or None
        text_casing = request.form.get("textCasing") or None

        # --- Optional color customizations ---
        primary_color = request.form.get("primaryColor") or None
        highlight_color = request.form.get("highlightColor") or None
        outline_color = request.form.get("outlineColor") or None
        background_color = request.form.get("backgroundColor") or None

        # --- Create job ---
        job_id = storage.create_job(
            video_path=video_path,
            caption_style=caption_style,
            caption_position=caption_position,
            original_filename=file.filename,
            file_size=file_size,
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

        # --- Start background processing (skipped in test mode) ---
        if not testing:
            _start_processing_thread(app, job_id)

        return jsonify({"jobId": job_id, "status": "pending"}), 200

    @app.get("/api/status/<job_id>")
    def status(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        transcript = job.get("transcript")
        if not transcript:
            data_dir: str = app.config["DATA_DIR"]
            transcript_path = os.path.join(data_dir, "output", job_id, "transcript.json")
            if os.path.isfile(transcript_path):
                try:
                    with open(transcript_path, "r", encoding="utf-8") as fh:
                        transcript = json.load(fh)
                except Exception:
                    transcript = None

        return jsonify({
            "jobId": job["job_id"],
            "status": job["status"],
            "progress": job["progress"],
            "currentPhase": job["current_phase"],
            "language": job["language"],
            "durationSeconds": job["duration_seconds"],
            "errorMessage": job["error_message"],
            "processingTimeMs": job.get("processing_time_ms"),
            "transcript": transcript,
            "createdAt": job["created_at"],
            "updatedAt": job["updated_at"],
        })

    @app.get("/api/transcript/<job_id>")
    def get_transcript(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        transcript = job.get("transcript")
        if not transcript:
            data_dir: str = app.config["DATA_DIR"]
            transcript_path = os.path.join(data_dir, "output", job_id, "transcript.json")
            if os.path.isfile(transcript_path):
                try:
                    with open(transcript_path, "r", encoding="utf-8") as fh:
                        transcript = json.load(fh)
                except Exception:
                    transcript = None

        if not transcript:
            return jsonify({"error": "Transcript not available yet"}), 404

        return jsonify(transcript)

    @app.post("/api/rerender/<job_id>")
    def rerender(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        data_dir: str = app.config["DATA_DIR"]
        payload = request.get_json(silent=True) or {}
        transcript = payload.get("transcript")

        caption_style = payload.get("captionStyle") or job.get("caption_style")
        if caption_style and not is_valid_caption_style(caption_style):
            return jsonify({"error": f"Invalid captionStyle '{caption_style}'"}), 400

        caption_position = payload.get("captionPosition", job.get("caption_position", 10))
        try:
            caption_position = int(caption_position)
        except (ValueError, TypeError):
            return jsonify({"error": "captionPosition must be an integer"}), 400

        custom_font = payload.get("customFont") or job.get("custom_font")
        font_weight = payload.get("fontWeight") or job.get("font_weight")
        weight_transition = payload.get("weightTransition") or job.get("weight_transition", "none")
        font_style = payload.get("fontStyle") or job.get("font_style")
        text_casing = payload.get("textCasing") or job.get("text_casing")
        primary_color = payload.get("primaryColor") or job.get("primary_color")
        highlight_color = payload.get("highlightColor") or job.get("highlight_color")
        outline_color = payload.get("outlineColor") or job.get("outline_color")
        background_color = payload.get("backgroundColor") or job.get("background_color")

        is_sync = request.args.get("sync", "").lower() == "true" or app.config.get("TESTING", False)

        def _do_rerender():
            from caption_job import rerender_caption_job

            rerender_caption_job(
                storage,
                job_id,
                data_dir,
                transcript=transcript,
                caption_style=caption_style,
                caption_position=caption_position,
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

        if is_sync:
            try:
                _do_rerender()
                return jsonify({"jobId": job_id, "status": "completed"}), 200
            except Exception as exc:
                storage.update_status(job_id, status="failed", error=str(exc))
                return jsonify({"error": str(exc)}), 500
        else:
            storage.update_status(job_id, status="processing", phase="burning", progress=50)

            def _thread_target():
                with app.app_context():
                    try:
                        _do_rerender()
                    except Exception as exc:
                        storage.update_status(job_id, status="failed", error=str(exc))

            thread = threading.Thread(target=_thread_target, daemon=True)
            thread.start()
            return jsonify({"jobId": job_id, "status": "processing"}), 200

    @app.get("/api/export/<job_id>")
    def export_subtitles(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        fmt = request.args.get("format", "srt").lower()
        data_dir: str = app.config["DATA_DIR"]

        if fmt == "ass":
            ass_path = os.path.join(data_dir, "output", job_id, "subtitles.ass")
            if not os.path.isfile(ass_path):
                ass_path = os.path.join(data_dir, "temp", job_id, "subtitles.ass")
            if not os.path.isfile(ass_path):
                return jsonify({"error": "ASS file not found"}), 404
            return send_file(ass_path, as_attachment=True, download_name=f"subtitles-{job_id}.ass")

        transcript = job.get("transcript")
        if not transcript:
            transcript_path = os.path.join(data_dir, "output", job_id, "transcript.json")
            if os.path.isfile(transcript_path):
                try:
                    with open(transcript_path, "r", encoding="utf-8") as fh:
                        transcript = json.load(fh)
                except Exception:
                    transcript = None

        if not transcript:
            return jsonify({"error": "Transcript not available"}), 404

        from subtitle_utils import transcript_to_srt, transcript_to_vtt, transcript_to_txt

        if fmt == "srt":
            content = transcript_to_srt(transcript)
            return Response(
                content,
                mimetype="text/plain; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="subtitles-{job_id}.srt"'},
            )
        elif fmt == "vtt":
            content = transcript_to_vtt(transcript)
            return Response(
                content,
                mimetype="text/vtt; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="subtitles-{job_id}.vtt"'},
            )
        elif fmt == "txt":
            content = transcript_to_txt(transcript)
            return Response(
                content,
                mimetype="text/plain; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="transcript-{job_id}.txt"'},
            )
        else:
            return jsonify({"error": f"Unsupported export format '{fmt}'. Allowed: srt, vtt, txt, ass"}), 400

    @app.get("/api/video/<job_id>")
    def stream_video(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        data_dir: str = app.config["DATA_DIR"]
        video_type = request.args.get("type", "captioned").lower()

        if video_type == "original":
            target_path = job.get("video_path")
        else:
            target_path = job.get("output_path")
            if not target_path or not os.path.isfile(target_path):
                target_path = os.path.join(data_dir, "output", job_id, "captioned.mp4")

        if not target_path or not os.path.isfile(target_path):
            return jsonify({"error": "Video file not found"}), 404

        resp = send_file(target_path, conditional=True, mimetype="video/mp4")
        resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return resp

    @app.get("/api/download/<job_id>")
    def download(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        if job["status"] != "completed":
            return jsonify({"error": "Job not completed yet"}), 409

        data_dir: str = app.config["DATA_DIR"]
        output_path = job.get("output_path")
        if not output_path or not os.path.isfile(output_path):
            # Fallback: construct from convention
            output_path = os.path.join(data_dir, "output", job_id, "captioned.mp4")
        if not os.path.isfile(output_path):
            return jsonify({"error": "Output file not found"}), 404

        orig_name = job.get("original_filename")
        if orig_name:
            stem = pathlib.Path(orig_name).stem
            download_name = f"captioned-{stem}.mp4"
        else:
            download_name = "captioned.mp4"

        resp = send_file(output_path, as_attachment=True, download_name=download_name)
        resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        resp.headers["Pragma"] = "no-cache"
        resp.headers["Expires"] = "0"
        return resp

    @app.delete("/api/jobs/<job_id>")
    def delete_job(job_id: str):
        storage: JobStorage = app.config["STORAGE"]
        job = storage.get_job(job_id)
        if job is None:
            return jsonify({"error": "Job not found"}), 404

        # Remove associated files
        for path_key in ("video_path", "output_path"):
            path = job.get(path_key)
            if path and os.path.isfile(path):
                try:
                    os.remove(path)
                except OSError:
                    pass

        storage.delete_job(job_id)
        return jsonify({"deleted": True})

    return app


def _cleanup_old_outputs(data_dir: str, storage: JobStorage, ttl_hours: int) -> None:
    """Delete output directories (and their job records) older than ttl_hours."""
    output_dir = os.path.join(data_dir, "output")
    if not os.path.exists(output_dir):
        return

    cutoff = time.time() - (ttl_hours * 3600)
    for job_id in os.listdir(output_dir):
        job_path = os.path.join(output_dir, job_id)
        if os.path.isdir(job_path):
            mtime = os.path.getmtime(job_path)
            if mtime < cutoff:
                shutil.rmtree(job_path, ignore_errors=True)
                storage.delete_job(job_id)


def _schedule_cleanup(app: Flask, ttl_hours: int, interval_seconds: int = 3600) -> None:
    """Run _cleanup_old_outputs immediately and then every interval_seconds in a daemon thread."""
    def run():
        while True:
            with app.app_context():
                _cleanup_old_outputs(
                    app.config["DATA_DIR"],
                    app.config["STORAGE"],
                    ttl_hours,
                )
            time.sleep(interval_seconds)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()


def _start_processing_thread(app: Flask, job_id: str) -> None:
    """Start a background thread to process the video job."""
    def run():
        with app.app_context():
            storage: JobStorage = app.config["STORAGE"]
            data_dir: str = app.config["DATA_DIR"]
            job = storage.get_job(job_id)
            if job is None:
                return
            try:
                # Import here to avoid heavy deps at startup
                from caption_job import process_caption_job

                process_caption_job(
                    storage,
                    job_id,
                    job["video_path"],
                    job["caption_style"],
                    job["caption_position"],
                    data_dir,
                    custom_font=job.get("custom_font"),
                    font_weight=job.get("font_weight"),
                    weight_transition=job.get("weight_transition", "none"),
                    primary_color=job.get("primary_color"),
                    highlight_color=job.get("highlight_color"),
                    outline_color=job.get("outline_color"),
                    background_color=job.get("background_color"),
                    font_style=job.get("font_style"),
                    text_casing=job.get("text_casing"),
                )
            except Exception as exc:  # noqa: BLE001
                storage.update_status(job_id, status="failed", error=str(exc))

    thread = threading.Thread(target=run, daemon=True)
    thread.start()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", os.environ.get("BACKEND_PORT", "5001")))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    application = create_app()
    application.run(host="0.0.0.0", port=port, debug=debug)
