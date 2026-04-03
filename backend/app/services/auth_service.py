from datetime import datetime, timedelta, timezone
from typing import Optional

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from jose import JWTError, jwt

from app.core.config import settings


def validate_google_token(token: str) -> dict:
    """
    Validate a Google ID token and return its claims.
    Raises ValueError if the token is invalid.
    """
    try:
        claims = google_id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.google_client_id,
        )
        return claims
    except Exception as exc:
        raise ValueError(f"Invalid Google token: {exc}") from exc


def create_access_token(user_id: str, email: str) -> str:
    """Mint a backend JWT for the given user."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a backend JWT. Returns None if invalid/expired."""
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
