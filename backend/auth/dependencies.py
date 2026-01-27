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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    """Validate JWT and return payload for any authenticated user/admin."""
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return payload


def require_roles(allowed_roles: set[str]):
    """Dependency factory to enforce role-based access."""

    async def _role_checker(payload: dict = Depends(get_current_user)) -> dict:
        role = payload.get("role")
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return payload

    return _role_checker


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    """Backward-compatible admin-only dependency (primary or secondary)."""
    payload = await get_current_user(credentials)  # type: ignore[arg-type]
    if payload.get("role") not in {"primary_admin", "secondary_admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
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
