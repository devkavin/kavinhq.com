from datetime import timedelta

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import create_token, decode_token
from app.db.session import get_db
from app.models import AdminUser
from app.schemas.auth import LoginInput
from app.schemas.user import UserRead
from app.services.auth import InvalidCredentials, LoginLocked, authenticate, login_identifier

router = APIRouter()


def set_auth_cookies(response: Response, request: Request, user_id: str, refresh: bool = True) -> None:
    secret = request.app.state.settings.jwt_secret
    secure = request.url.scheme == "https"
    if request.app.state.settings.trust_proxy_headers:
        forwarded_scheme = request.headers.get("x-forwarded-proto", "").split(",")[0].strip().lower()
        secure = secure or forwarded_scheme == "https"
    same_site = "none" if secure else "lax"
    access = create_token(user_id, "access", secret, timedelta(minutes=15))
    response.set_cookie("access_token", access, max_age=900, httponly=True, secure=secure, samesite=same_site, path="/")
    if refresh:
        refresh_token = create_token(user_id, "refresh", secret, timedelta(days=7))
        response.set_cookie("refresh_token", refresh_token, max_age=604800, httponly=True, secure=secure, samesite=same_site, path="/api/auth")


@router.post("/login", response_model=UserRead)
def login(payload: LoginInput, request: Request, response: Response, db: Session = Depends(get_db)):
    identifier = login_identifier(request, payload.email, request.app.state.settings)
    try:
        user = authenticate(db, identifier, payload.email, payload.password)
    except LoginLocked as error:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.") from error
    except InvalidCredentials as error:
        raise HTTPException(status_code=401, detail="Invalid email or password") from error
    set_auth_cookies(response, request, user.id)
    return user


@router.post("/refresh", response_model=UserRead)
def refresh(request: Request, response: Response, refresh_token: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token required")
    try:
        payload = decode_token(refresh_token, request.app.state.settings.jwt_secret, "refresh")
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token") from error
    user = db.get(AdminUser, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    set_auth_cookies(response, request, user.id, refresh=False)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/auth")


@router.get("/me", response_model=UserRead)
def me(user: AdminUser = Depends(get_current_user)):
    return user
