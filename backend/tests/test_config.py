from app.core.config import Settings


def test_settings_parse_origins_and_keep_secrets_out_of_repr(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "mysql+pymysql://user:secret@db:3306/site")
    monkeypatch.setenv("JWT_SECRET", "jwt-secret")
    monkeypatch.setenv("ADMIN_EMAIL", "admin@example.com")
    monkeypatch.setenv("ADMIN_PASSWORD", "admin-secret")
    monkeypatch.setenv("CORS_ORIGINS", "https://kavinhq.com, http://localhost:5173")

    settings = Settings.from_env()

    assert settings.cors_origins == ["https://kavinhq.com", "http://localhost:5173"]
    assert settings.trust_proxy_headers is False
    assert "secret" not in repr(settings)


def test_settings_parse_trusted_proxy_flag(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    settings = Settings.from_env(require_secrets=False)
    assert settings.trust_proxy_headers is True
