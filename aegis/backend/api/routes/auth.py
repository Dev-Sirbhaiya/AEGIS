"""Authentication endpoints — login, refresh, user management."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from passlib.hash import bcrypt
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config.settings import settings
from db.session import get_db
from models.user import User

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    user_id: str
    username: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "operator"


def create_token(user: User, expires_delta: timedelta) -> str:
    """Create a JWT token for a user."""
    payload = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + expires_delta,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    if not user or not bcrypt.verify(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    access_expires = timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    refresh_expires = timedelta(days=7)

    return TokenResponse(
        access_token=create_token(user, access_expires),
        refresh_token=create_token(user, refresh_expires),
        expires_in=settings.JWT_EXPIRY_MINUTES * 60,
        user=UserInfo(
            user_id=str(user.id),
            username=user.username,
            role=user.role,
        ),
    )


@router.post("/refresh")
async def refresh_token(body: dict):
    """Refresh an access token using a refresh token."""
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="refresh_token required")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        # Create new access token
        new_token = jwt.encode(
            {
                "sub": payload["sub"],
                "username": payload.get("username", ""),
                "role": payload.get("role", "operator"),
                "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRY_MINUTES),
                "iat": datetime.utcnow(),
            },
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM,
        )
        return {"access_token": new_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if username exists
    result = await db.execute(select(User).where(User.username == body.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=bcrypt.hash(body.password),
        role=body.role,
    )
    db.add(user)
    await db.flush()
    return user.to_dict()
