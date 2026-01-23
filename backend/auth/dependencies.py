"""
FastAPI dependencies for authentication and authorization.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from auth.jwt_handler import decode_access_token
from utils.config import settings

# Security schemes
bearer_scheme = HTTPBearer(auto_error=True)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    """
    Dependency to verify JWT token and get current admin.
    Used for protecting admin routes.
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        Decoded token payload with admin info
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return payload


async def verify_device_api_key(
    api_key: str = Depends(api_key_header)
) -> bool:
    """
    Dependency to verify device API key.
    Used for protecting device routes.
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        True if API key is valid
        
    Raises:
        HTTPException: If API key is invalid
    """
    if api_key != settings.DEVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    
    return True
