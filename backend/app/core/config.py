import os
from dataclasses import dataclass, field


@dataclass(repr=True)
class Settings:
    database_url: str = field(default="sqlite:///./kavinhq.db", repr=False)
    jwt_secret: str = field(default="development-only-secret", repr=False)
    admin_email: str = "admin@example.com"
    admin_password: str = field(default="change-me", repr=False)
    frontend_url: str = "http://localhost:5173"
    cors_origins: list[str] = field(default_factory=lambda: ["http://localhost:5173"])
    trust_proxy_headers: bool = False

    @classmethod
    def from_env(cls, require_secrets: bool = True) -> "Settings":
        required = ["DATABASE_URL", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"]
        if require_secrets:
            missing = [name for name in required if not os.getenv(name)]
            if missing:
                raise RuntimeError(f"Missing required environment values: {', '.join(missing)}")
        origins = os.getenv("CORS_ORIGINS", os.getenv("FRONTEND_URL", "http://localhost:5173"))
        return cls(
            database_url=os.getenv("DATABASE_URL", "sqlite:///./kavinhq.db"),
            jwt_secret=os.getenv("JWT_SECRET", "development-only-secret"),
            admin_email=os.getenv("ADMIN_EMAIL", "admin@example.com"),
            admin_password=os.getenv("ADMIN_PASSWORD", "change-me"),
            frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
            cors_origins=[value.strip() for value in origins.split(",") if value.strip()],
            trust_proxy_headers=os.getenv("TRUST_PROXY_HEADERS", "false").lower() in {"1", "true", "yes"},
        )
