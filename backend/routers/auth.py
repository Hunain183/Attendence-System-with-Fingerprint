"""
Authentication router - Login and registration.
Supports primary admin (env-configured), secondary admins, and users stored in DB.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from schemas.auth import LoginRequest, LoginResponse
from schemas.user import UserCreate, UserResponse
from auth.jwt_handler import (
    create_access_token,
    verify_admin_credentials,
    verify_password,
    hash_password,
)
from utils.config import settings
from database import get_db
from models.user import User

router = APIRouter(prefix="/admin", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Public registration endpoint.
    Creates an inactive user; primary admin must approve before login.
    """
    if user_in.username == settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot use the primary admin username",
        )

    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    user = User(
        username=user_in.username,
        password_hash=hash_password(user_in.password),
        role="user",
        is_active=False,  # requires primary admin approval
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
async def admin_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Admin login endpoint.
    
    Authenticates admin credentials and returns JWT token.
    
    Args:
        login_data: Username and password
        
    Returns:
        JWT access token and expiration info
        
    Raises:
        HTTPException 401: Invalid credentials
    """
    # Primary admin (env-based)
    if login_data.username == settings.ADMIN_USERNAME:
        if not verify_admin_credentials(login_data.username, login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
        role = "primary_admin"
        token_type = "admin"
    else:
        # DB-backed accounts (users or secondary admins)
        user = db.query(User).filter(User.username == login_data.username).first()

        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account pending primary admin approval",
            )

        role = user.role
        token_type = "admin" if role == "secondary_admin" else "user"
    
    # Create access token with role
    access_token = create_access_token(
        data={"sub": login_data.username, "type": token_type, "role": role}
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600,
        role=role,
    )
