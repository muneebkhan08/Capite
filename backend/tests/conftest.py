"""Shared test fixtures for backend tests."""
import os
import pytest

@pytest.fixture
def app():
    os.environ["MAX_FILE_SIZE_MB"] = "10"
    os.environ["MAX_DURATION_MINUTES"] = "5"
    os.environ["MAX_CONCURRENT_JOBS"] = "2"
    os.environ["FRONTEND_URL"] = "http://localhost:3000"
    from app import create_app
    app = create_app(testing=True)
    yield app

@pytest.fixture
def client(app):
    return app.test_client()
