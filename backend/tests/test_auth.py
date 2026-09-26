from datetime import datetime, timedelta, timezone

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.auth import router
from app.core.config import Settings
from app.core.security import create_token, decode_token, hash_password
from app.db.session import get_db
from app.models import AdminUser, LoginAttempt
from app.models.base import Base
from app.services.auth import InvalidCredentials, authenticate

TEST_SECRET = "test-secret-that-is-at-least-32-bytes-long"


@pytest.fixture()
def auth_client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    local_session = sessionmaker(bind=engine, expire_on_commit=False)
    with local_session() as session:
        session.add(AdminUser(email="admin@kavinhq.com", password_hash=hash_password("correct-password"), name="Kavin", role="admin"))
        session.commit()

    app = FastAPI()
    app.state.settings = Settings(jwt_secret=TEST_SECRET, trust_proxy_headers=False)
    app.include_router(router, prefix="/api/auth")

    def override_db():
        with local_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    return TestClient(app), local_session, app


def test_login_sets_tokens_and_me_accepts_cookie(auth_client):
    client, _, _ = auth_client
    response = client.post("/api/auth/login", json={"email": "ADMIN@KAVINHQ.COM", "password": "correct-password"})
    assert response.status_code == 200
    assert response.json()["email"] == "admin@kavinhq.com"
    assert "access_token" in client.cookies
    assert client.get("/api/auth/me").status_code == 200


def test_bearer_access_and_refresh_token_type_rejection(auth_client):
    client, session_factory, _ = auth_client
    with session_factory() as session:
        user = session.query(AdminUser).first()
    access = create_token(user.id, "access", TEST_SECRET, timedelta(minutes=15))
    refresh = create_token(user.id, "refresh", TEST_SECRET, timedelta(days=7))
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {access}"}).status_code == 200
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {refresh}"}).status_code == 401


def test_fifth_failure_locks_identifier_for_fifteen_minutes(auth_client):
    client, session_factory, _ = auth_client
    for _ in range(4):
        assert client.post("/api/auth/login", json={"email": "admin@kavinhq.com", "password": "wrong"}).status_code == 401
    assert client.post("/api/auth/login", json={"email": "admin@kavinhq.com", "password": "wrong"}).status_code == 429
    with session_factory() as session:
        attempt = session.query(LoginAttempt).first()
        assert attempt.failures == 5
        locked_until = attempt.locked_until.replace(tzinfo=timezone.utc) if attempt.locked_until.tzinfo is None else attempt.locked_until
        assert locked_until > datetime.now(timezone.utc) + timedelta(minutes=14)


def test_successful_login_resets_failure_record(auth_client):
    client, session_factory, _ = auth_client
    client.post("/api/auth/login", json={"email": "admin@kavinhq.com", "password": "wrong"})
    assert client.post("/api/auth/login", json={"email": "admin@kavinhq.com", "password": "correct-password"}).status_code == 200
    with session_factory() as session:
        assert session.query(LoginAttempt).count() == 0


def test_refresh_rotates_access_and_logout_clears_cookies(auth_client):
    client, _, _ = auth_client
    client.post("/api/auth/login", json={"email": "admin@kavinhq.com", "password": "correct-password"})
    old_access = client.cookies["access_token"]
    assert client.post("/api/auth/refresh").status_code == 200
    assert client.cookies["access_token"]
    assert decode_token(client.cookies["access_token"], TEST_SECRET, "access")["sub"]
    assert client.post("/api/auth/logout").status_code == 204
    assert "access_token" not in client.cookies


def test_https_login_marks_cookie_secure(auth_client):
    client, _, _ = auth_client
    response = client.post("https://testserver/api/auth/login", json={"email": "admin@kavinhq.com", "password": "correct-password"})
    assert "Secure" in response.headers["set-cookie"]


def test_forwarded_https_is_trusted_only_when_enabled(auth_client):
    client, _, app = auth_client
    headers = {"X-Forwarded-Proto": "https"}
    payload = {"email": "admin@kavinhq.com", "password": "correct-password"}

    untrusted = client.post("http://testserver/api/auth/login", json=payload, headers=headers)
    assert "Secure" not in untrusted.headers["set-cookie"]

    app.state.settings.trust_proxy_headers = True
    trusted = client.post("http://testserver/api/auth/login", json=payload, headers=headers)
    assert "Secure" in trusted.headers["set-cookie"]


def test_expired_lockout_starts_a_fresh_failure_window(auth_client):
    _, session_factory, _ = auth_client
    identifier = "testclient:admin@kavinhq.com"
    now = datetime.now(timezone.utc)
    with session_factory() as session:
        session.add(LoginAttempt(identifier=identifier, failures=5, locked_until=now - timedelta(seconds=1)))
        session.commit()
        with pytest.raises(InvalidCredentials):
            authenticate(session, identifier, "admin@kavinhq.com", "wrong", now=now)
        attempt = session.get(LoginAttempt, identifier)
        assert attempt.failures == 1
        assert attempt.locked_until is None
