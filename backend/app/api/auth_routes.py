from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.user import User, UserPreferences
from app.services.auth_service import validate_google_token, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleAuthRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    display_name: str | None
    is_new_user: bool = False


@router.post("/google", response_model=AuthResponse)
async def google_auth(payload: GoogleAuthRequest, session: AsyncSession = Depends(get_session)):
    """
    Validate a Google ID token from next-auth.
    Upserts the user row by google_sub and returns a backend JWT.
    """
    try:
        claims = validate_google_token(payload.id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    google_sub = claims["sub"]
    email = claims.get("email", "")
    display_name = claims.get("name")

    # Upsert user by google_sub
    result = await session.execute(select(User).where(User.google_sub == google_sub))
    user = result.scalar_one_or_none()

    is_new_user = user is None
    if is_new_user:
        user = User(email=email, google_sub=google_sub, display_name=display_name)
        session.add(user)
        await session.flush()  # get user.id before creating preferences

        prefs = UserPreferences(user_id=user.id)
        session.add(prefs)

    await session.commit()
    await session.refresh(user)

    token = create_access_token(str(user.id), user.email)
    return AuthResponse(
        access_token=token,
        user_id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        is_new_user=is_new_user,
    )
