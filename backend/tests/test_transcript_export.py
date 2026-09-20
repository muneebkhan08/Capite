"""Unit tests for transcript export formats and studio endpoints."""

import io
import json
import pytest
from app import create_app
from job_storage import JobStorage
from subtitle_utils import transcript_to_srt, transcript_to_vtt, transcript_to_txt


@pytest.fixture
def sample_transcript():
    return {
        "language": "en",
        "segments": [
            {
                "start": 0.0,
                "end": 2.5,
                "text": "Hello world welcome to captions",
                "words": [
                    {"word": "Hello", "start": 0.0, "end": 0.5},
                    {"word": "world", "start": 0.6, "end": 1.0},
                    {"word": "welcome", "start": 1.1, "end": 1.5},
                    {"word": "to", "start": 1.6, "end": 1.8},
                    {"word": "captions", "start": 1.9, "end": 2.5},
                ],
            },
            {
                "start": 2.8,
                "end": 4.5,
                "text": "Make your videos stand out",
                "words": [
                    {"word": "Make", "start": 2.8, "end": 3.1},
                    {"word": "your", "start": 3.2, "end": 3.4},
                    {"word": "videos", "start": 3.5, "end": 3.8},
                    {"word": "stand", "start": 3.9, "end": 4.1},
                    {"word": "out", "start": 4.2, "end": 4.5},
                ],
            },
        ],
    }


def test_transcript_to_srt(sample_transcript):
    srt = transcript_to_srt(sample_transcript)
    assert "1\n00:00:00,000 --> 00:00:02,500\nHello world welcome to captions" in srt
    assert "2\n00:00:02,800 --> 00:00:04,500\nMake your videos stand out" in srt


def test_transcript_to_vtt(sample_transcript):
    vtt = transcript_to_vtt(sample_transcript)
    assert vtt.startswith("WEBVTT\n")
    assert "00:00:00.000 --> 00:00:02.500" in vtt
    assert "Hello world welcome to captions" in vtt
    assert "Make your videos stand out" in vtt


def test_transcript_to_txt(sample_transcript):
    txt = transcript_to_txt(sample_transcript)
    assert "Hello world welcome to captions\n\nMake your videos stand out\n" == txt


@pytest.fixture
def test_client():
    app = create_app(testing=True)
    with app.test_client() as client:
        yield client, app


def test_get_transcript_endpoint(test_client, sample_transcript):
    client, app = test_client
    storage: JobStorage = app.config["STORAGE"]

    job_id = storage.create_job(
        video_path="/tmp/fake.mp4",
        caption_style="hormozi",
        caption_position=10,
        original_filename="fake.mp4",
        file_size=1024,
    )
    storage.update_status(job_id, status="completed", transcript=sample_transcript)

    resp = client.get(f"/api/transcript/{job_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["language"] == "en"
    assert len(data["segments"]) == 2
    assert data["segments"][0]["text"] == "Hello world welcome to captions"


def test_export_subtitles_endpoint(test_client, sample_transcript):
    client, app = test_client
    storage: JobStorage = app.config["STORAGE"]

    job_id = storage.create_job(
        video_path="/tmp/fake.mp4",
        caption_style="kapwing-viral",
        caption_position=15,
        original_filename="fake.mp4",
        file_size=1024,
    )
    storage.update_status(job_id, status="completed", transcript=sample_transcript)

    # SRT
    resp_srt = client.get(f"/api/export/{job_id}?format=srt")
    assert resp_srt.status_code == 200
    assert "00:00:00,000 --> 00:00:02,500" in resp_srt.get_data(as_text=True)

    # VTT
    resp_vtt = client.get(f"/api/export/{job_id}?format=vtt")
    assert resp_vtt.status_code == 200
    assert "WEBVTT" in resp_vtt.get_data(as_text=True)

    # TXT
    resp_txt = client.get(f"/api/export/{job_id}?format=txt")
    assert resp_txt.status_code == 200
    assert "Hello world welcome to captions" in resp_txt.get_data(as_text=True)


def test_rerender_endpoint_invalid_style(test_client):
    client, app = test_client
    storage: JobStorage = app.config["STORAGE"]
    job_id = storage.create_job(
        video_path="/tmp/fake.mp4",
        caption_style="hormozi",
        caption_position=10,
        original_filename="fake.mp4",
        file_size=1024,
    )

    resp = client.post(
        f"/api/rerender/{job_id}",
        json={"captionStyle": "invalid-style-xyz"},
    )
    assert resp.status_code == 400
    assert "Invalid captionStyle" in resp.get_json()["error"]
