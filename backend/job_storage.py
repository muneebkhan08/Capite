"""In-memory job storage with optional JSON file persistence."""

import json
import threading
import uuid
from datetime import datetime, timezone
from typing import Optional


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class JobStorage:
    """Thread-safe in-memory job store with optional JSON persistence.

    Job data keys:
        job_id, video_path, caption_style, caption_position,
        original_filename, file_size, status, progress,
        current_phase, language, duration_seconds, error_message,
        created_at, updated_at
    """

    ACTIVE_STATUSES = {"pending", "processing"}

    def __init__(self, persist_path: Optional[str] = None) -> None:
        self._lock = threading.Lock()
        self._jobs: dict[str, dict] = {}
        self._persist_path = persist_path
        if persist_path:
            self._load()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def create_job(
        self,
        video_path: str,
        caption_style: str,
        caption_position: int,
        original_filename: str,
        file_size: int,
        custom_font: Optional[str] = None,
        font_weight: Optional[str] = None,
        weight_transition: Optional[str] = None,
        primary_color: Optional[str] = None,
        highlight_color: Optional[str] = None,
        outline_color: Optional[str] = None,
        background_color: Optional[str] = None,
        font_style: Optional[str] = None,
        text_casing: Optional[str] = None,
    ) -> str:
        """Create a new job and return its UUID."""
        job_id = str(uuid.uuid4())
        now = _now_iso()
        job = {
            "job_id": job_id,
            "video_path": video_path,
            "caption_style": caption_style,
            "caption_position": caption_position,
            "original_filename": original_filename,
            "file_size": file_size,
            "custom_font": custom_font,
            "font_weight": font_weight,
            "weight_transition": weight_transition or "none",
            "primary_color": primary_color,
            "highlight_color": highlight_color,
            "outline_color": outline_color,
            "background_color": background_color,
            "font_style": font_style or "default",
            "text_casing": text_casing or "default",
            "status": "pending",
            "progress": 0,
            "current_phase": None,
            "language": None,
            "duration_seconds": None,
            "error_message": None,
            "output_path": None,
            "processing_time_ms": None,
            "transcript": None,
            "created_at": now,
            "updated_at": now,
        }
        with self._lock:
            self._jobs[job_id] = job
            self._persist()
        return job_id

    def get_job(self, job_id: str) -> Optional[dict]:
        """Return a copy of the job dict, or None if not found."""
        with self._lock:
            job = self._jobs.get(job_id)
            return dict(job) if job is not None else None

    def update_status(
        self,
        job_id: str,
        *,
        status: Optional[str] = None,
        phase: Optional[str] = None,
        progress: Optional[int] = None,
        language: Optional[str] = None,
        duration: Optional[float] = None,
        error: Optional[str] = None,
        output_path: Optional[str] = None,
        processing_time_ms: Optional[int] = None,
        transcript: Optional[dict] = None,
    ) -> bool:
        """Update job fields. Only provided (non-None) values are written.

        Returns True if the job was found and updated, False otherwise.
        """
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return False
            if status is not None:
                job["status"] = status
            if phase is not None:
                job["current_phase"] = phase
            if progress is not None:
                job["progress"] = progress
            if language is not None:
                job["language"] = language
            if duration is not None:
                job["duration_seconds"] = duration
            if error is not None:
                job["error_message"] = error
            if output_path is not None:
                job["output_path"] = output_path
            if processing_time_ms is not None:
                job["processing_time_ms"] = processing_time_ms
            if transcript is not None:
                job["transcript"] = transcript
            job["updated_at"] = _now_iso()
            self._persist()
        return True

    def update_job(self, job_id: str, **kwargs) -> bool:
        """Update arbitrary job fields."""
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return False
            for k, v in kwargs.items():
                if v is not None:
                    job[k] = v
            job["updated_at"] = _now_iso()
            self._persist()
        return True

    def delete_job(self, job_id: str) -> bool:
        """Remove a job. Returns True if it existed, False otherwise."""
        with self._lock:
            existed = self._jobs.pop(job_id, None) is not None
            if existed:
                self._persist()
        return existed

    def list_jobs(self) -> list[dict]:
        """Return all jobs as copies, sorted newest-first by created_at."""
        with self._lock:
            jobs = [dict(j) for j in self._jobs.values()]
        jobs.sort(key=lambda j: j["created_at"], reverse=True)
        return jobs

    def active_job_count(self) -> int:
        """Count jobs whose status is 'pending' or 'processing'."""
        with self._lock:
            return sum(
                1 for j in self._jobs.values() if j["status"] in self.ACTIVE_STATUSES
            )

    # ------------------------------------------------------------------
    # Persistence helpers (must be called while holding self._lock)
    # ------------------------------------------------------------------

    def _persist(self) -> None:
        if not self._persist_path:
            return
        with open(self._persist_path, "w", encoding="utf-8") as fh:
            json.dump(self._jobs, fh, indent=2)

    def _load(self) -> None:
        try:
            with open(self._persist_path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            if isinstance(data, dict):
                self._jobs = data
        except (FileNotFoundError, json.JSONDecodeError):
            self._jobs = {}
