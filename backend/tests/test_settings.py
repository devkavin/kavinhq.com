def test_public_settings_only_return_whatsapp_values(api_client):
    client, _ = api_client
    body = client.get("/api/settings").json()
    assert set(body) == {"whatsapp_number", "whatsapp_message"}


def test_settings_update_requires_admin_and_persists(admin_client):
    client, _ = admin_client
    payload = {"whatsapp_number": "94771234567", "whatsapp_message": "Hello, I would like to discuss a project."}
    assert client.put("/api/settings", json=payload).status_code == 200
    assert client.get("/api/settings").json() == payload
