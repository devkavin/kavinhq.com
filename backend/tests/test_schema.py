from types import SimpleNamespace

import pytest
from sqlalchemy import create_engine, inspect

from app.db.schema import COLUMN_DEFINITIONS, SchemaRepairRequired, build_add_column_sql, ensure_schema
from app.models.base import Base


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


def test_additive_schema_map_covers_every_model_column():
    for table in Base.metadata.sorted_tables:
        assert set(table.columns.keys()) <= set(COLUMN_DEFINITIONS[table.name].keys())


def test_empty_table_definitions_restore_required_keys_and_values():
    assert build_add_column_sql("admin_users", "id").endswith("VARCHAR(36) NOT NULL PRIMARY KEY")
    assert build_add_column_sql("projects", "id").endswith("INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY")
    assert build_add_column_sql("settings", "key").endswith("VARCHAR(120) NOT NULL PRIMARY KEY")


def test_add_column_sql_rejects_unmanaged_names():
    try:
        build_add_column_sql("projects; DROP TABLE projects", "year")
    except ValueError as error:
        assert "Unmanaged" in str(error)
    else:
        raise AssertionError("unmanaged table was accepted")


class FakeResult:
    def __init__(self, rows=(), scalar=None):
        self.rows = rows
        self.scalar = scalar

    def __iter__(self):
        return iter(self.rows)

    def scalar_one(self):
        return self.scalar


class FakeConnection:
    def __init__(self, tables):
        self.tables = tables
        self.alters = []

    def execute(self, statement, params=None):
        sql = str(statement)
        table = (params or {}).get("table")
        if "information_schema.columns" in sql:
            return FakeResult([(column,) for column in self.tables[table]["columns"]])
        if "information_schema.key_column_usage" in sql:
            return FakeResult([(column,) for column in self.tables[table]["primary"]])
        if sql.startswith("SELECT COUNT"):
            table = sql.split("`")[1]
            return FakeResult(scalar=self.tables[table]["rows"])
        if sql.startswith("ALTER TABLE"):
            self.alters.append(sql)
            return FakeResult()
        raise AssertionError(f"Unexpected SQL: {sql}")


class FakeMysqlEngine:
    def __init__(self, tables):
        self.dialect = SimpleNamespace(name="mysql")
        self.url = SimpleNamespace(database="kavinhq")
        self.connection = FakeConnection(tables)

    def begin(self):
        connection = self.connection

        class Context:
            def __enter__(self):
                return connection

            def __exit__(self, *_args):
                return False

        return Context()


def complete_tables():
    return {
        table: {"columns": set(columns), "primary": {"id" if table in {"admin_users", "projects"} else "key" if table == "settings" else "identifier"}, "rows": 0}
        for table, columns in COLUMN_DEFINITIONS.items()
    }


def test_populated_partial_table_fails_before_any_alter(monkeypatch):
    tables = complete_tables()
    tables["projects"]["columns"].remove("id")
    tables["projects"]["primary"] = set()
    tables["projects"]["rows"] = 3
    engine = FakeMysqlEngine(tables)
    monkeypatch.setattr(Base.metadata, "create_all", lambda *_args, **_kwargs: None)

    with pytest.raises(SchemaRepairRequired, match="No schema changes were applied"):
        ensure_schema(engine)

    assert engine.connection.alters == []


def test_empty_partial_table_adds_complete_identity_definition(monkeypatch):
    tables = complete_tables()
    tables["projects"]["columns"].remove("id")
    tables["projects"]["primary"] = set()
    engine = FakeMysqlEngine(tables)
    monkeypatch.setattr(Base.metadata, "create_all", lambda *_args, **_kwargs: None)

    ensure_schema(engine)

    assert engine.connection.alters == ["ALTER TABLE `projects` ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY"]
