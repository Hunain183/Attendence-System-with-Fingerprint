"""
Authentication router - Admin login endpoint.
"""
from fastapi import APIRouter, HTTPException, status

from schemas.auth import LoginRequest, LoginResponse
from auth.jwt_handler import create_access_token, verify_admin_credentials
from utils.config import settings

router = APIRouter(prefix="/admin", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def admin_login(login_data: LoginRequest):
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
    # Verify credentials
    if not verify_admin_credentials(login_data.username, login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": login_data.username, "type": "admin"}
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600  # Convert to seconds
    )
