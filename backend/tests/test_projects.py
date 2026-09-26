def project_payload(slug="verification-project"):
    return {
        "title": "Verification Project",
        "slug": slug,
        "description": "A complete project used to verify protected writes.",
        "category": "Business Sites",
        "image_url": "https://images.unsplash.com/photo.jpg",
        "live_url": "https://example.com",
        "gallery": ["https://images.unsplash.com/gallery.jpg"],
        "story": "Challenge.\n\nResult.",
        "stack": "React, FastAPI",
        "year": 2026,
        "featured": False,
        "sort_order": 90,
    }


def test_public_projects_are_ordered_and_filterable(api_client):
    client, _ = api_client
    projects = client.get("/api/projects").json()
    assert [project["sort_order"] for project in projects] == sorted(project["sort_order"] for project in projects)
    assert len(client.get("/api/projects?featured=true").json()) == 4
    assert all(project["category"] == "E-Commerce" for project in client.get("/api/projects?category=E-Commerce").json())
    assert client.get(f"/api/projects/{projects[0]['slug']}").status_code == 200
    assert client.get("/api/projects/missing-project").status_code == 404


def test_project_writes_require_authentication(api_client):
    client, _ = api_client
    assert client.post("/api/projects", json=project_payload()).status_code == 401


def test_admin_can_create_replace_and_delete_project(admin_client):
    client, _ = admin_client
    created = client.post("/api/projects", json=project_payload())
    assert created.status_code == 201
    project = created.json()
    assert client.post("/api/projects", json=project_payload()).status_code == 409
    update = project_payload()
    update["title"] = "Updated Verification Project"
    assert client.put(f"/api/projects/{project['id']}", json=update).json()["title"] == update["title"]
    assert client.delete(f"/api/projects/{project['id']}").status_code == 204
    assert client.get("/api/projects/verification-project").status_code == 404
