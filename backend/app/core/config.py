import os
from dataclasses import dataclass, field


@dataclass(repr=True)
class Settings:
    database_url: str = field(default="", repr=False)
    jwt_secret: str = field(default="", repr=False)
    admin_email: str = ""
    admin_password: str = field(default="", repr=False)
    frontend_url: str = ""
    cors_origins: list[str] = field(default_factory=list)
    trust_proxy_headers: bool = False

    @classmethod
    def from_env(cls, require_secrets: bool = True) -> "Settings":
        required = ["DATABASE_URL", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD", "FRONTEND_URL", "CORS_ORIGINS"]
        if require_secrets:
            missing = [name for name in required if not os.getenv(name)]
            if missing:
                raise RuntimeError(f"Missing required environment values: {', '.join(missing)}")
        origins = os.getenv("CORS_ORIGINS", os.getenv("FRONTEND_URL", ""))
        return cls(
            database_url=os.getenv("DATABASE_URL", ""),
            jwt_secret=os.getenv("JWT_SECRET", ""),
            admin_email=os.getenv("ADMIN_EMAIL", ""),
            admin_password=os.getenv("ADMIN_PASSWORD", ""),
            frontend_url=os.getenv("FRONTEND_URL", ""),
            cors_origins=[value.strip() for value in origins.split(",") if value.strip()],
            trust_proxy_headers=os.getenv("TRUST_PROXY_HEADERS", "false").lower() in {"1", "true", "yes"},
        )
