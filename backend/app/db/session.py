from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings

settings = Settings.from_env(require_secrets=False)
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
