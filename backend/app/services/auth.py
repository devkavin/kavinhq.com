from datetime import datetime, timedelta, timezone

from fastapi import Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import verify_password
from app.models import AdminUser, LoginAttempt


class InvalidCredentials(Exception):
    pass


class LoginLocked(Exception):
    pass


def login_identifier(request: Request, email: str, settings: Settings) -> str:
    ip = request.client.host if request.client else "unknown"
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        if forwarded:
            ip = forwarded
    return f"{ip}:{email.strip().lower()}"


def authenticate(session: Session, identifier: str, email: str, password: str, now: datetime | None = None) -> AdminUser:
    now = now or datetime.now(timezone.utc)
    attempt = session.get(LoginAttempt, identifier)
    if attempt and attempt.locked_until:
        locked_until = attempt.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if locked_until > now:
            raise LoginLocked

    user = session.scalar(select(AdminUser).where(AdminUser.email == email.strip().lower()))
    if not user or not verify_password(password, user.password_hash):
        if not attempt:
            attempt = LoginAttempt(identifier=identifier, failures=0)
            session.add(attempt)
        attempt.failures += 1
        if attempt.failures >= 5:
            attempt.locked_until = now + timedelta(minutes=15)
            session.commit()
            raise LoginLocked
        session.commit()
        raise InvalidCredentials

    if attempt:
        session.delete(attempt)
    session.commit()
    return user
