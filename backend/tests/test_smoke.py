def test_backend_application_exports_fastapi_app():
    from server import app

    assert app.title == "KAVINHQ API"
