"""Tests for Flask API endpoints."""
import io
import os
import pytest

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert "version" in data

def test_process_no_file(client):
    response = client.post("/api/process", data={"captionStyle": "hormozi", "captionPosition": "10"})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data

def test_process_invalid_style(client):
    data = {"file": (io.BytesIO(b"fake video content"), "test.mp4"), "captionStyle": "nonexistent", "captionPosition": "10"}
    response = client.post("/api/process", data=data, content_type="multipart/form-data")
    assert response.status_code == 400

def test_process_invalid_position(client):
    data = {"file": (io.BytesIO(b"fake video content"), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "99"}
    response = client.post("/api/process", data=data, content_type="multipart/form-data")
    assert response.status_code == 400

def test_process_invalid_file_type(client):
    data = {"file": (io.BytesIO(b"not a video"), "test.txt"), "captionStyle": "hormozi", "captionPosition": "10"}
    response = client.post("/api/process", data=data, content_type="multipart/form-data")
    assert response.status_code == 400

def test_process_valid_request(client):
    data = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
    response = client.post("/api/process", data=data, content_type="multipart/form-data")
    assert response.status_code == 200
    result = response.get_json()
    assert "jobId" in result
    assert result["status"] == "pending"


def test_process_with_crimson_pop_and_custom_colors(client):
    data = {
        "file": (io.BytesIO(b"\x00" * 100), "test.mp4"),
        "captionStyle": "crimson-pop",
        "captionPosition": "15",
        "primaryColor": "#FFFFFF",
        "highlightColor": "#DC2626",
        "outlineColor": "#000000",
    }
    response = client.post("/api/process", data=data, content_type="multipart/form-data")
    assert response.status_code == 200
    result = response.get_json()
    assert "jobId" in result
    assert result["status"] == "pending"

def test_status_not_found(client):
    response = client.get("/api/status/nonexistent-id")
    assert response.status_code == 404

def test_status_after_submit(client):
    data = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "mrbeast", "captionPosition": "20"}
    submit_response = client.post("/api/process", data=data, content_type="multipart/form-data")
    job_id = submit_response.get_json()["jobId"]
    response = client.get(f"/api/status/{job_id}")
    assert response.status_code == 200
    status_data = response.get_json()
    assert status_data["jobId"] == job_id
    assert status_data["status"] in ("pending", "processing")

def test_delete_job(client):
    data = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
    submit_response = client.post("/api/process", data=data, content_type="multipart/form-data")
    job_id = submit_response.get_json()["jobId"]
    response = client.delete(f"/api/jobs/{job_id}")
    assert response.status_code == 200
    assert response.get_json()["deleted"] is True
    response = client.get(f"/api/status/{job_id}")
    assert response.status_code == 404

def test_delete_nonexistent(client):
    response = client.delete("/api/jobs/nonexistent")
    assert response.status_code == 404

def test_download_not_found(client):
    response = client.get("/api/download/nonexistent")
    assert response.status_code == 404

def test_download_not_completed(client):
    data = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
    submit_response = client.post("/api/process", data=data, content_type="multipart/form-data")
    job_id = submit_response.get_json()["jobId"]
    response = client.get(f"/api/download/{job_id}")
    assert response.status_code == 409

def test_download_completed_with_output_path(app, client):
    """Download succeeds when output_path is stored and file exists."""
    storage = app.config["STORAGE"]
    data_dir = app.config["DATA_DIR"]
    # Submit a job
    form = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
    submit_response = client.post("/api/process", data=form, content_type="multipart/form-data")
    job_id = submit_response.get_json()["jobId"]
    # Simulate completion: create output file and set output_path
    output_dir = os.path.join(data_dir, "output", job_id)
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "captioned.mp4")
    with open(output_file, "wb") as f:
        f.write(b"\x00\x00\x00\x1cftypisom")  # minimal mp4 header bytes
    storage.update_status(job_id, status="completed", progress=100, output_path=output_file)
    response = client.get(f"/api/download/{job_id}")
    assert response.status_code == 200

def test_download_completed_fallback_path(app, client):
    """Download uses fallback path when output_path not stored but file exists at convention path."""
    storage = app.config["STORAGE"]
    data_dir = app.config["DATA_DIR"]
    form = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
    submit_response = client.post("/api/process", data=form, content_type="multipart/form-data")
    job_id = submit_response.get_json()["jobId"]
    # Create the output file at the convention path but do NOT set output_path
    output_dir = os.path.join(data_dir, "output", job_id)
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "captioned.mp4"), "wb") as f:
        f.write(b"\x00\x00\x00\x1cftypisom")
    storage.update_status(job_id, status="completed", progress=100)
    response = client.get(f"/api/download/{job_id}")
    assert response.status_code == 200

def test_concurrent_job_limit(app, client):
    """Returns 429 when MAX_CONCURRENT_JOBS is reached."""
    app.config["MAX_CONCURRENT"] = 2
    # Submit 2 jobs to fill the limit
    for _ in range(2):
        form = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
        resp = client.post("/api/process", data=form, content_type="multipart/form-data")
        assert resp.status_code == 200
    # Third job should be rejected
    form = {"file": (io.BytesIO(b"\x00" * 100), "test.mp4"), "captionStyle": "hormozi", "captionPosition": "10"}
    response = client.post("/api/process", data=form, content_type="multipart/form-data")
    assert response.status_code == 429
    assert "concurrent" in response.get_json()["error"].lower()


def test_process_with_custom_colors_and_none(app, client):
    """Submitting with backgroundColor and outlineColor='none' stores them on the job."""
    storage = app.config["STORAGE"]
    form = {
        "file": (io.BytesIO(b"\x00" * 100), "test.mp4"),
        "captionStyle": "crimson-pop",
        "captionPosition": "15",
        "primaryColor": "#FFFFFF",
        "highlightColor": "#E11D48",
        "outlineColor": "none",
        "backgroundColor": "#10B981",
    }
    response = client.post("/api/process", data=form, content_type="multipart/form-data")
    assert response.status_code == 200
    job_id = response.get_json()["jobId"]
    job = storage.get_job(job_id)
    assert job["primary_color"] == "#FFFFFF"
    assert job["highlight_color"] == "#E11D48"
    assert job["outline_color"] == "none"
    assert job["background_color"] == "#10B981"

