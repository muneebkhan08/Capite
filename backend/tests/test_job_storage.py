"""Tests for job storage — in-memory dict with JSON persistence."""

import json
import os
import tempfile
import pytest


def test_create_job():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    job_id = storage.create_job(
        video_path="/tmp/test.mp4",
        caption_style="hormozi",
        caption_position=10,
        original_filename="test.mp4",
        file_size=1024,
    )
    assert job_id is not None
    job = storage.get_job(job_id)
    assert job["status"] == "pending"
    assert job["caption_style"] == "hormozi"
    assert job["caption_position"] == 10
    assert job["progress"] == 0


def test_get_job_not_found():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    assert storage.get_job("nonexistent") is None


def test_update_status():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    job_id = storage.create_job("/tmp/test.mp4", "hormozi", 10, "test.mp4", 1024)
    storage.update_status(job_id, status="processing", phase="transcribing", progress=25, language="en")
    job = storage.get_job(job_id)
    assert job["status"] == "processing"
    assert job["current_phase"] == "transcribing"
    assert job["progress"] == 25
    assert job["language"] == "en"


def test_update_status_completed():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    job_id = storage.create_job("/tmp/test.mp4", "hormozi", 10, "test.mp4", 1024)
    storage.update_status(job_id, status="completed", progress=100)
    job = storage.get_job(job_id)
    assert job["status"] == "completed"
    assert job["progress"] == 100


def test_update_status_failed():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    job_id = storage.create_job("/tmp/test.mp4", "hormozi", 10, "test.mp4", 1024)
    storage.update_status(job_id, status="failed", error="Out of memory")
    job = storage.get_job(job_id)
    assert job["status"] == "failed"
    assert job["error_message"] == "Out of memory"


def test_delete_job():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    job_id = storage.create_job("/tmp/test.mp4", "hormozi", 10, "test.mp4", 1024)
    storage.delete_job(job_id)
    assert storage.get_job(job_id) is None


def test_list_jobs():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    id1 = storage.create_job("/tmp/a.mp4", "hormozi", 10, "a.mp4", 100)
    id2 = storage.create_job("/tmp/b.mp4", "mrbeast", 20, "b.mp4", 200)
    jobs = storage.list_jobs()
    assert len(jobs) == 2
    job_ids = {j["job_id"] for j in jobs}
    assert id1 in job_ids
    assert id2 in job_ids


def test_persistence_save_and_load():
    from job_storage import JobStorage
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
        persist_path = f.name
    try:
        storage1 = JobStorage(persist_path=persist_path)
        job_id = storage1.create_job("/tmp/test.mp4", "karaoke", 15, "test.mp4", 500)
        storage1.update_status(job_id, status="completed", progress=100)
        storage2 = JobStorage(persist_path=persist_path)
        job = storage2.get_job(job_id)
        assert job is not None
        assert job["status"] == "completed"
        assert job["caption_style"] == "karaoke"
    finally:
        os.unlink(persist_path)


def test_concurrent_job_count():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    id1 = storage.create_job("/tmp/a.mp4", "hormozi", 10, "a.mp4", 100)
    id2 = storage.create_job("/tmp/b.mp4", "hormozi", 10, "b.mp4", 100)
    id3 = storage.create_job("/tmp/c.mp4", "hormozi", 10, "c.mp4", 100)
    storage.update_status(id1, status="processing")
    storage.update_status(id3, status="completed", progress=100)
    assert storage.active_job_count() == 2  # id1 (processing) + id2 (pending)


def test_create_job_with_custom_colors():
    from job_storage import JobStorage
    storage = JobStorage(persist_path=None)
    job_id = storage.create_job(
        "/tmp/custom.mp4",
        "crimson-pop",
        15,
        "custom.mp4",
        2048,
        primary_color="#FFFFFF",
        highlight_color="#E11D48",
        outline_color="none",
        background_color="#10B981",
    )
    job = storage.get_job(job_id)
    assert job["primary_color"] == "#FFFFFF"
    assert job["highlight_color"] == "#E11D48"
    assert job["outline_color"] == "none"
    assert job["background_color"] == "#10B981"

