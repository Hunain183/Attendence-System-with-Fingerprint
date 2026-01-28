"""
Admin user management routes.
Allows primary admin to create users, promote to secondary admin, and delete users.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin
from auth.jwt_handler import hash_password
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, UserListResponse
from utils.config import settings

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


ALLOWED_ADMIN_ROLES = {"primary_admin", "secondary_admin"}


def require_primary_admin(admin_payload: dict = Depends(get_current_admin)) -> dict:
    """Ensure the caller is the primary admin."""
    if admin_payload.get("role") != "primary_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the primary admin can perform this action",
        )
    return admin_payload


@router.get("/", response_model=UserListResponse)
async def list_users(
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all users (excluding the env-based primary admin)."""
    users = db.query(User).all()
    return UserListResponse(total=len(users), users=users)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    admin_payload: dict = Depends(require_primary_admin),
    db: Session = Depends(get_db),
):
    """Create a new regular user. Primary admin only."""
    # Prevent duplicating primary admin username
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
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/promote", response_model=UserResponse)
async def promote_to_secondary_admin(
    user_id: int,
    admin_payload: dict = Depends(require_primary_admin),
    db: Session = Depends(get_db),
):
    """Promote a user to secondary admin. Primary admin only."""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.username == settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot promote the primary admin record",
        )

    user.role = "secondary_admin"
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/demote", response_model=UserResponse)
async def demote_to_user(
    user_id: int,
    admin_payload: dict = Depends(require_primary_admin),
    db: Session = Depends(get_db),
):
    """Demote a secondary admin to regular user. Primary admin only."""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.username == settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote the primary admin",
        )

    if user.role != "secondary_admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a secondary admin",
        )

    user.role = "user"
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin_payload: dict = Depends(require_primary_admin),
    db: Session = Depends(get_db),
):
    """Delete a user account. Primary admin only. Cannot remove primary admin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.username == settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot remove the primary admin",
        )

    db.delete(user)
    db.commit()
    return None


@router.post("/{user_id}/approve", response_model=UserResponse)
async def approve_user(
    user_id: int,
    admin_payload: dict = Depends(require_primary_admin),
    db: Session = Depends(get_db),
):
    """Approve a pending user (activate account). Primary admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.username == settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primary admin does not require approval",
        )

    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
