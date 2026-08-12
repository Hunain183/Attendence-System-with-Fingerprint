"""
Application configuration using Pydantic Settings.
Loads environment variables from .env file.
Supports both development (SQLite) and production (PostgreSQL) environments.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database Configuration
    # Development: sqlite:///./attendance.db
    # Production: postgresql+asyncpg://user:password@host:port/dbname
    DATABASE_URL: str = "sqlite:///./attendance.db"
    
    # JWT Configuration
    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"  # Use generate-secret-key script
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # Device API Key for fingerprint devices
    DEVICE_API_KEY: str = "your-device-api-key-change-in-production"
    
    # Encryption Key (must be 32 characters for Fernet)
    ENCRYPTION_KEY: str = "your-32-character-encryption-key!"
    
    # Admin Credentials (for primary admin only)
    # Secondary admins are created via the user management system
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    
    # CORS Configuration
    # For production: set to your frontend URL (e.g., https://example.com)
    # For development: http://localhost:3000
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Server Configuration
    # Render and other cloud platforms provide PORT environment variable
    # This allows listening on any port required
    SERVER_HOST: str = "0.0.0.0"  # Listen on all interfaces for cloud deployment
    SERVER_PORT: int = 8000
    
    # Application Environment
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Legacy JWT_SECRET_KEY support (deprecated, use SECRET_KEY instead)
    JWT_SECRET_KEY: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_secret_key(self) -> str:
        """
        Get the JWT secret key.
        Supports both new SECRET_KEY and legacy JWT_SECRET_KEY.
        """
        if self.SECRET_KEY != "your-super-secret-jwt-key-change-in-production":
            return self.SECRET_KEY
        if self.JWT_SECRET_KEY:
            return self.JWT_SECRET_KEY
        return "your-super-secret-jwt-key-change-in-production"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid reading .env file on every call.
    """
    return Settings()


# Global settings instance
settings = get_settings()

