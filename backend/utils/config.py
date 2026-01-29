"""
Application configuration using Pydantic Settings.
Loads environment variables from .env file.
"""
from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./attendance.db"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # Device API Key
    DEVICE_API_KEY: str = "your-device-api-key-change-in-production"
    
    # Encryption Key (must be 32 characters for Fernet)
    ENCRYPTION_KEY: str = "your-32-character-encryption-key!"
    
    # Admin Credentials
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid reading .env file on every call.
    """
    return Settings()


# Global settings instance
settings = get_settings()
