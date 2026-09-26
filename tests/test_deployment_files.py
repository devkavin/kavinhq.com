from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_container_images_and_runtime_commands_are_pinned():
    backend = text("backend/Dockerfile")
    frontend = text("frontend/Dockerfile")

    assert "FROM python:3.11-slim" in backend
    assert 'CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]' in backend
    assert "FROM node:20-alpine" in frontend
    assert "FROM nginx:alpine" in frontend
    assert 'ARG VITE_API_BASE=""' in frontend


def test_nginx_serves_spa_assets_and_proxies_the_api():
    nginx = text("frontend/nginx.conf")

    assert "try_files $uri $uri/ /index.html" in nginx
    assert "proxy_pass http://backend:8001" in nginx
    assert "gzip on" in nginx
    assert "expires 30d" in nginx


def test_compose_uses_external_database_configuration_only():
    production = text("docker-compose.yml")
    admin = text("docker-compose.admin.yml")

    for compose in (production, admin):
        assert "DATABASE_URL" in compose
        assert "JWT_SECRET" in compose
        assert "ADMIN_EMAIL" in compose
        assert "ADMIN_PASSWORD" in compose
        assert "FRONTEND_URL" in compose
        assert "CORS_ORIGINS" in compose
        assert "mysql:" not in compose.lower()
        assert "mariadb:" not in compose.lower()


def test_operator_guides_cover_required_security_and_workflows():
    deploy = text("DEPLOY.md").lower()
    readme = text("README.md").lower()

    for phrase in (
        "coolify",
        "local admin",
        "least-privilege",
        "backup",
        "tls",
        "create tables only if missing",
    ):
        assert phrase in deploy

    assert "native development" in readme
    assert "docker compose" in readme
