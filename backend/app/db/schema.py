from sqlalchemy import Engine, text

from app.models import AdminUser, LoginAttempt, Project, Setting  # noqa: F401
from app.models.base import Base


COLUMN_DEFINITIONS = {
    "admin_users": {
        "email": "VARCHAR(255) NOT NULL",
        "password_hash": "VARCHAR(255) NOT NULL",
        "name": "VARCHAR(120) NOT NULL DEFAULT 'Kavin'",
        "role": "VARCHAR(30) NOT NULL DEFAULT 'admin'",
        "created_at": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
    "projects": {
        "title": "VARCHAR(255) NOT NULL",
        "slug": "VARCHAR(255) NOT NULL",
        "description": "TEXT NOT NULL",
        "category": "VARCHAR(120) NOT NULL",
        "image_url": "TEXT NOT NULL",
        "live_url": "TEXT NOT NULL",
        "gallery": "JSON NOT NULL",
        "story": "TEXT NOT NULL",
        "stack": "TEXT NOT NULL",
        "year": "INTEGER NOT NULL DEFAULT 2025",
        "featured": "BOOLEAN NOT NULL DEFAULT FALSE",
        "sort_order": "INTEGER NOT NULL DEFAULT 0",
        "created_at": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
    "settings": {"value": "TEXT NOT NULL"},
    "login_attempts": {
        "failures": "INTEGER NOT NULL DEFAULT 0",
        "locked_until": "DATETIME NULL",
    },
}


def build_add_column_sql(table: str, column: str) -> str:
    try:
        definition = COLUMN_DEFINITIONS[table][column]
    except KeyError as error:
        raise ValueError("Unmanaged table or column") from error
    return f"ALTER TABLE `{table}` ADD COLUMN `{column}` {definition}"


def ensure_schema(db_engine: Engine) -> None:
    Base.metadata.create_all(db_engine, checkfirst=True)
    if db_engine.dialect.name != "mysql":
        return
    database = db_engine.url.database
    with db_engine.begin() as connection:
        for table, columns in COLUMN_DEFINITIONS.items():
            rows = connection.execute(
                text(
                    "SELECT COLUMN_NAME FROM information_schema.columns "
                    "WHERE table_schema = :database AND table_name = :table"
                ),
                {"database": database, "table": table},
            )
            existing = {row[0] for row in rows}
            for column in columns.keys() - existing:
                connection.execute(text(build_add_column_sql(table, column)))
