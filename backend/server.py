from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker

from app.api.router import api_router
from app.core.config import Settings
from app.db.schema import ensure_schema
from app.services.seeding import seed_if_empty


def create_app(app_settings: Settings | None = None, db_engine: Engine | None = None) -> FastAPI:
    app_settings = app_settings or Settings.from_env()
    db_engine = db_engine or create_engine(app_settings.database_url, pool_pre_ping=True)
    factory = sessionmaker(bind=db_engine, autoflush=False, expire_on_commit=False)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        ensure_schema(db_engine)
        with factory() as session:
            seed_if_empty(session, app_settings)
        yield

    application = FastAPI(title="KAVINHQ API", lifespan=lifespan)
    application.state.settings = app_settings
    application.state.engine = db_engine
    application.state.session_factory = factory
    application.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router)
    return application


app = create_app()
