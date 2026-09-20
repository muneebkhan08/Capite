"""Tests for caption job processing pipeline (with mocked heavy dependencies)."""
import os
import tempfile
from unittest.mock import patch
import pytest
from job_storage import JobStorage

@pytest.fixture
def storage():
    return JobStorage(persist_path=None)

@pytest.fixture
def temp_dir():
    d = tempfile.mkdtemp()
    yield d
    import shutil
    shutil.rmtree(d, ignore_errors=True)

def _create_fake_video(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(b"\x00" * 1000)

def test_process_updates_status_to_completed(storage, temp_dir):
    from caption_job import process_caption_job
    video_path = os.path.join(temp_dir, "temp", "test-job", "original.mp4")
    _create_fake_video(video_path)
    job_id = storage.create_job(video_path, "hormozi", 10, "test.mp4", 1000)
    fake_transcript = {
        "language": "en",
        "segments": [{"start": 0.0, "end": 2.0, "text": "Hello world",
            "words": [{"word": "Hello", "start": 0.0, "end": 0.5}, {"word": "world", "start": 0.6, "end": 1.0}]}]
    }
    with patch("caption_job.probe_video") as mock_probe, \
         patch("caption_job.transcribe_audio") as mock_transcribe, \
         patch("caption_job.generate_ass_from_transcript") as mock_ass, \
         patch("caption_job.burn_subtitles") as mock_burn:
        mock_probe.return_value = (1920, 1080, 5.0)
        mock_transcribe.return_value = fake_transcript
        mock_ass.return_value = True
        mock_burn.return_value = True
        output_dir = os.path.join(temp_dir, "output", job_id)
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, "captioned.mp4"), "wb") as f:
            f.write(b"\x00" * 500)
        process_caption_job(storage, job_id, video_path, "hormozi", 10, temp_dir)
    job = storage.get_job(job_id)
    assert job["status"] == "completed"
    assert job["progress"] == 100
    assert job["language"] == "en"
    assert job["duration_seconds"] == 5.0
    assert job["output_path"] is not None
    assert job["output_path"].endswith("captioned.mp4")

def test_process_handles_error(storage, temp_dir):
    from caption_job import process_caption_job
    video_path = os.path.join(temp_dir, "temp", "test-job", "original.mp4")
    _create_fake_video(video_path)
    job_id = storage.create_job(video_path, "hormozi", 10, "test.mp4", 1000)
    with patch("caption_job.probe_video") as mock_probe:
        mock_probe.side_effect = Exception("ffprobe failed")
        process_caption_job(storage, job_id, video_path, "hormozi", 10, temp_dir)
    job = storage.get_job(job_id)
    assert job["status"] == "failed"
    assert "ffprobe failed" in job["error_message"]

def test_process_updates_phases(storage, temp_dir):
    from caption_job import process_caption_job
    video_path = os.path.join(temp_dir, "temp", "test-job", "original.mp4")
    _create_fake_video(video_path)
    job_id = storage.create_job(video_path, "hormozi", 10, "test.mp4", 1000)
    phases_seen = []
    original_update = storage.update_status
    def track_phases(jid, **kwargs):
        if kwargs.get("phase"):
            phases_seen.append(kwargs["phase"])
        original_update(jid, **kwargs)
    storage.update_status = track_phases
    fake_transcript = {
        "language": "en",
        "segments": [{"start": 0.0, "end": 2.0, "text": "Test",
            "words": [{"word": "Test", "start": 0.0, "end": 1.0}]}]
    }
    with patch("caption_job.probe_video") as mock_probe, \
         patch("caption_job.transcribe_audio") as mock_transcribe, \
         patch("caption_job.generate_ass_from_transcript") as mock_ass, \
         patch("caption_job.burn_subtitles") as mock_burn:
        mock_probe.return_value = (1080, 1920, 3.0)
        mock_transcribe.return_value = fake_transcript
        mock_ass.return_value = True
        mock_burn.return_value = True
        output_dir = os.path.join(temp_dir, "output", job_id)
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, "captioned.mp4"), "wb") as f:
            f.write(b"\x00" * 500)
        process_caption_job(storage, job_id, video_path, "hormozi", 10, temp_dir)
    assert "transcribing" in phases_seen
    assert "burning" in phases_seen
    assert "finalizing" in phases_seen
