"""
Pydantic schemas for user accounts and admin management.
"""
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict


UserRole = Literal["user", "secondary_admin"]


class UserCreate(BaseModel):
    """Schema for creating a new user (non-primary)."""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    """Schema for returning user info (without password)."""
    id: int
    username: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    """Schema for listing users."""
    total: int
    users: list[UserResponse]
