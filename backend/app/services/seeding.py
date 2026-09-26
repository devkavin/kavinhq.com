import bcrypt
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models import AdminUser, Project, Setting


GALLERY = [
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?crop=entropy&cs=srgb&fm=jpg&q=85",
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?crop=entropy&cs=srgb&fm=jpg&q=85",
]

PROJECTS = [
    ("ApexMetrics SaaS Dashboard", "apexmetrics-saas-dashboard", "Custom Apps & Fixing", "High-concurrency realtime analytics system built with Next.js, FastAPI and Tailwind, with complex data made effortless to read.", "Next.js, FastAPI, PostgreSQL, Tailwind CSS", 2025, "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85"),
    ("Vanguard Apparel Storefront", "vanguard-apparel-storefront", "E-Commerce", "Minimalist headless e-commerce experience with sub-second page loads and micro-interactions on every touchpoint.", "Headless Commerce, React, Tailwind CSS, Sanity CMS", 2024, "https://images.unsplash.com/photo-1539278383962-a7774385fa02?crop=entropy&cs=srgb&fm=jpg&q=85"),
    ("Pulse Fintech Landing", "pulse-fintech-landing", "Landing Pages", "High-converting product landing page for a web3 mobile wallet with interactive 3D assets and a kinetic hero.", "React, Framer Motion, Three.js", 2025, "https://images.unsplash.com/photo-1697292859724-0d2501966448?crop=entropy&cs=srgb&fm=jpg&q=85"),
    ("NexaCloud Infrastructure Hub", "nexacloud-infrastructure-hub", "Business Sites", "Enterprise cloud consultancy corporate portal with automated appointment booking and an airtight SEO structure.", "Next.js, Tailwind CSS, Booking API", 2024, "https://images.unsplash.com/photo-1706700392642-dee59f678a09?crop=entropy&cs=srgb&fm=jpg&q=85"),
    ("Aether Template UI System", "aether-template-ui-system", "Templates & Custom", "Modular design system and production-ready React starter kit for modern startups that ship fast.", "React, TypeScript, Tailwind CSS, Radix UI", 2025, "https://images.unsplash.com/photo-1634084462412-b54873c0a56d?crop=entropy&cs=srgb&fm=jpg&q=85"),
    ("Kinetix Managed Hosting Platform", "kinetix-managed-hosting-platform", "Hosting & Infrastructure", "Custom Coolify and Docker deployment stack with SSL, automated backups and zero-downtime updates.", "Docker, Coolify, GitHub Actions", 2025, "https://images.unsplash.com/photo-1771922748624-b205cf5d002d?crop=entropy&cs=srgb&fm=jpg&q=85"),
]


def seed_if_empty(session: Session, settings: Settings) -> None:
    if session.scalar(select(func.count()).select_from(AdminUser)) == 0:
        password_hash = bcrypt.hashpw(settings.admin_password.encode(), bcrypt.gensalt()).decode()
        session.add(AdminUser(email=settings.admin_email.lower(), password_hash=password_hash, name="Kavin", role="admin"))

    if session.scalar(select(func.count()).select_from(Project)) == 0:
        for index, item in enumerate(PROJECTS, start=1):
            title, slug, category, description, stack, year, image_url = item
            session.add(Project(
                title=title,
                slug=slug,
                description=description,
                category=category,
                image_url=image_url,
                live_url=f"https://{slug.split('-')[0]}.kavinhq.com",
                gallery=list(GALLERY),
                story=(
                    f"The challenge was to give {title} a clear structure without losing the detail its users rely on. We mapped the highest-value journeys and removed friction from every decision point.\n\n"
                    "The finished build pairs a focused interface with a fast, maintainable foundation. The result is easier to use, easier to find, and ready to grow without a rebuild."
                ),
                stack=stack,
                year=year,
                featured=index <= 4,
                sort_order=index,
            ))

    if session.scalar(select(func.count()).select_from(Setting)) == 0:
        session.add_all([
            Setting(key="whatsapp_number", value="15550192834"),
            Setting(key="whatsapp_message", value="Hello KAVINHQ! I checked out your portfolio and would like to discuss a project with you."),
        ])
    session.commit()
