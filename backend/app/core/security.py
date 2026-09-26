from datetime import datetime, timedelta, timezone

import bcrypt
import jwt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except (ValueError, TypeError):
        return False


def create_token(subject: str, token_type: str, secret: str, expires: timedelta) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": subject, "type": token_type, "iat": now, "exp": now + expires}, secret, algorithm="HS256")


def decode_token(token: str, secret: str, expected_type: str) -> dict:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    if payload.get("type") != expected_type or not payload.get("sub"):
        raise jwt.InvalidTokenError("Wrong token type")
    return payload
