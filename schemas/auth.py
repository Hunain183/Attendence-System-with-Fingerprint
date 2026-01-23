"""
Pydantic schemas for Authentication.
"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Schema for admin login request."""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)


class LoginResponse(BaseModel):
    """Schema for login response with JWT token."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenData(BaseModel):
    """Schema for decoded token data."""
    username: str
    exp: int
