from sqlalchemy import create_engine, inspect

from app.db.schema import build_add_column_sql, ensure_schema


def test_ensure_schema_creates_declared_tables_and_is_idempotent():
    engine = create_engine("sqlite:///:memory:")
    ensure_schema(engine)
    first = set(inspect(engine).get_table_names())
    ensure_schema(engine)
    second = set(inspect(engine).get_table_names())

    assert first == {"admin_users", "projects", "settings", "login_attempts"}
    assert second == first


def test_add_column_sql_uses_fixed_allowlist():
    sql = build_add_column_sql("projects", "year")
    assert sql == "ALTER TABLE `projects` ADD COLUMN `year` INTEGER NOT NULL DEFAULT 2025"


def test_add_column_sql_rejects_unmanaged_names():
    try:
        build_add_column_sql("projects; DROP TABLE projects", "year")
    except ValueError as error:
        assert "Unmanaged" in str(error)
    else:
        raise AssertionError("unmanaged table was accepted")
