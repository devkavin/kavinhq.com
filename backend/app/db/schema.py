from sqlalchemy import Engine, text

from app.models import AdminUser, LoginAttempt, Project, Setting  # noqa: F401
from app.models.base import Base


COLUMN_DEFINITIONS = {
    "admin_users": {
        "id": "VARCHAR(36) NOT NULL PRIMARY KEY",
        "email": "VARCHAR(255) NOT NULL UNIQUE",
        "password_hash": "VARCHAR(255) NOT NULL",
        "name": "VARCHAR(120) NOT NULL DEFAULT 'Kavin'",
        "role": "VARCHAR(30) NOT NULL DEFAULT 'admin'",
        "created_at": "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
    "projects": {
        "id": "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
        "title": "VARCHAR(255) NOT NULL",
        "slug": "VARCHAR(255) NOT NULL UNIQUE",
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
    "settings": {"key": "VARCHAR(120) NOT NULL PRIMARY KEY", "value": "TEXT NOT NULL"},
    "login_attempts": {
        "identifier": "VARCHAR(320) NOT NULL PRIMARY KEY",
        "failures": "INTEGER NOT NULL DEFAULT 0",
        "locked_until": "DATETIME NULL",
    },
}

PRIMARY_KEY_COLUMNS = {
    "admin_users": "id",
    "projects": "id",
    "settings": "key",
    "login_attempts": "identifier",
}

UNSAFE_ON_POPULATED = {
    "admin_users": {"id", "email", "password_hash"},
    "projects": {"id", "title", "slug", "description", "category", "image_url", "live_url", "gallery", "story", "stack"},
    "settings": {"key", "value"},
    "login_attempts": {"identifier"},
}


class SchemaRepairRequired(RuntimeError):
    pass


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
        plans = []
        for table, columns in COLUMN_DEFINITIONS.items():
            rows = connection.execute(
                text(
                    "SELECT COLUMN_NAME FROM information_schema.columns "
                    "WHERE table_schema = :database AND table_name = :table"
                ),
                {"database": database, "table": table},
            )
            existing = {row[0] for row in rows}
            missing = columns.keys() - existing
            primary_rows = connection.execute(
                text(
                    "SELECT COLUMN_NAME FROM information_schema.key_column_usage "
                    "WHERE table_schema = :database AND table_name = :table "
                    "AND constraint_name = 'PRIMARY'"
                ),
                {"database": database, "table": table},
            )
            primary = {row[0] for row in primary_rows}
            expected_primary = PRIMARY_KEY_COLUMNS[table]
            if expected_primary in existing and primary != {expected_primary}:
                raise SchemaRepairRequired(
                    f"{table} has incompatible primary-key metadata. Apply an operator-reviewed migration before startup."
                )
            if expected_primary in missing and primary:
                raise SchemaRepairRequired(
                    f"{table} already has a different primary key. Apply an operator-reviewed migration before startup."
                )
            row_count = connection.execute(text(f"SELECT COUNT(*) FROM `{table}`")).scalar_one()
            unsafe = missing & UNSAFE_ON_POPULATED[table]
            if row_count and unsafe:
                names = ", ".join(sorted(unsafe))
                raise SchemaRepairRequired(
                    f"{table} contains data and is missing required columns: {names}. "
                    "No schema changes were applied; complete an operator-reviewed migration first."
                )
            plans.append((table, missing))
        for table, missing in plans:
            for column in missing:
                connection.execute(text(build_add_column_sql(table, column)))
