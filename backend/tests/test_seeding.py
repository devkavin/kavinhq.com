from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models import AdminUser, Project, Setting
from app.models.base import Base
from app.services.seeding import seed_if_empty


def test_seed_creates_exact_defaults_and_preserves_them_on_restart():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    settings = Settings(admin_email="owner@kavinhq.com", admin_password="strong-password")

    with Session(engine) as session:
        seed_if_empty(session, settings)
        projects = session.scalars(select(Project).order_by(Project.sort_order)).all()
        admin = session.scalar(select(AdminUser))
        seeded_hash = admin.password_hash

        assert len(projects) == 6
        assert [project.featured for project in projects] == [True, True, True, True, False, False]
        assert all(len(project.gallery) == 2 for project in projects)
        assert all(len(project.story.split("\n\n")) == 2 for project in projects)
        assert session.get(Setting, "whatsapp_number").value == "15550192834"
        assert session.get(Setting, "whatsapp_message").value.startswith("Hello KAVINHQ!")

        session.get(Setting, "whatsapp_number").value = "94770000000"
        session.commit()
        seed_if_empty(session, Settings(admin_email="new@example.com", admin_password="new-password"))

        assert session.scalar(select(AdminUser)).password_hash == seeded_hash
        assert session.get(Setting, "whatsapp_number").value == "94770000000"
        assert len(session.scalars(select(Project)).all()) == 6
