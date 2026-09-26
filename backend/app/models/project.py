from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .admin_user import utcnow
from .base import Base


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    live_url: Mapped[str] = mapped_column(Text, nullable=False)
    gallery: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    story: Mapped[str] = mapped_column(Text, nullable=False, default="")
    stack: Mapped[str] = mapped_column(Text, nullable=False, default="")
    year: Mapped[int] = mapped_column(Integer, nullable=False, default=2025)
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
