import pytest
from pydantic import ValidationError

from app.schemas.project import ProjectCreate


def valid_project(**changes):
    data = {
        "title": "Apex",
        "slug": "apex-project",
        "description": "A clear project description.",
        "category": "Custom Apps",
        "image_url": "https://images.unsplash.com/photo.jpg",
        "live_url": "https://apex.kavinhq.com",
        "gallery": ["https://images.unsplash.com/one.jpg"],
        "story": "Challenge.\n\nResult.",
        "stack": "React, FastAPI",
        "year": 2025,
        "featured": True,
        "sort_order": 1,
    }
    data.update(changes)
    return data


def test_project_schema_accepts_valid_urls_and_slug():
    project = ProjectCreate(**valid_project())
    assert project.slug == "apex-project"


@pytest.mark.parametrize("slug", ["Apex Project", "apex_project", "-apex"])
def test_project_schema_rejects_invalid_slug(slug):
    with pytest.raises(ValidationError):
        ProjectCreate(**valid_project(slug=slug))


def test_project_schema_rejects_invalid_gallery_url():
    with pytest.raises(ValidationError):
        ProjectCreate(**valid_project(gallery=["not-a-url"]))
