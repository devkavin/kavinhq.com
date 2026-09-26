def test_health_verifies_database(api_client):
    client, _ = api_client
    assert client.get("/api/health").json() == {"status": "ok", "database": "connected"}


def test_health_reports_database_failure(api_client):
    client, app = api_client
    original = app.state.engine

    class BrokenEngine:
        def connect(self):
            raise RuntimeError("database unavailable with secret details")

    app.state.engine = BrokenEngine()
    response = client.get("/api/health")
    app.state.engine = original
    assert response.status_code == 503
    assert response.json() == {"status": "degraded", "database": "unavailable"}
    assert "secret" not in response.text
