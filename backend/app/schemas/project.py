import re
from datetime import datetime

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, field_validator


class ProjectBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    category: str = Field(min_length=2, max_length=120)
    image_url: AnyHttpUrl
    live_url: AnyHttpUrl
    gallery: list[AnyHttpUrl] = Field(default_factory=list)
    story: str = ""
    stack: str = ""
    year: int = Field(ge=2000, le=2100)
    featured: bool = False
    sort_order: int = 0

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
            raise ValueError("Slug must use lowercase letters, numbers, and single hyphens")
        return value


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
