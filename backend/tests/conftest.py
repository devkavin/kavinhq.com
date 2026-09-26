import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from server import create_app


@pytest.fixture()
def api_client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    settings = Settings(
        jwt_secret="test-secret-that-is-at-least-32-bytes-long",
        admin_email="admin@kavinhq.com",
        admin_password="correct-password",
        cors_origins=["https://kavinhq.test"],
    )
    app = create_app(settings, engine)
    with TestClient(app) as client:
        yield client, app


@pytest.fixture()
def admin_client(api_client):
    client, app = api_client
    response = client.post("/api/auth/login", json={"email": "admin@kavinhq.com", "password": "correct-password"})
    assert response.status_code == 200
    return client, app
