from sqlalchemy import inspect


def test_startup_creates_tables_seeds_content_and_applies_cors(api_client):
    client, app = api_client
    assert set(inspect(app.state.engine).get_table_names()) == {"admin_users", "projects", "settings", "login_attempts"}
    assert len(client.get("/api/projects").json()) == 6
    response = client.options(
        "/api/projects",
        headers={"Origin": "https://kavinhq.test", "Access-Control-Request-Method": "GET"},
    )
    assert response.headers["access-control-allow-origin"] == "https://kavinhq.test"
    assert response.headers["access-control-allow-credentials"] == "true"
