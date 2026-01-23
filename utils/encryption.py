"""
Encryption utilities for fingerprint template storage.
Uses Fernet symmetric encryption.
"""
from cryptography.fernet import Fernet
import base64
import hashlib

from utils.config import settings


class EncryptionService:
    """
    Service for encrypting and decrypting fingerprint templates.
    Uses Fernet symmetric encryption with a derived key.
    """
    
    def __init__(self):
        """Initialize encryption service with derived Fernet key."""
        # Derive a valid 32-byte key from the encryption key
        key = hashlib.sha256(settings.ENCRYPTION_KEY.encode()).digest()
        self._fernet = Fernet(base64.urlsafe_b64encode(key))
    
    def encrypt(self, data: str) -> str:
        """
        Encrypt a string and return base64-encoded ciphertext.
        
        Args:
            data: Plain text string to encrypt
            
        Returns:
            Base64-encoded encrypted string
        """
        if not data:
            return ""
        encrypted = self._fernet.encrypt(data.encode('utf-8'))
        return encrypted.decode('utf-8')
    
    def decrypt(self, encrypted_data: str) -> str:
        """
        Decrypt base64-encoded ciphertext.
        
        Args:
            encrypted_data: Base64-encoded encrypted string
            
        Returns:
            Decrypted plain text string
        """
        if not encrypted_data:
            return ""
        decrypted = self._fernet.decrypt(encrypted_data.encode('utf-8'))
        return decrypted.decode('utf-8')
    
    def verify_fingerprint(self, template: str, stored_encrypted_template: str) -> bool:
        """
        Verify if a fingerprint template matches the stored encrypted template.
        
        In a real implementation, this would use fingerprint matching algorithms
        with a similarity threshold. For now, we do exact comparison.
        
        Args:
            template: Raw fingerprint template from device
            stored_encrypted_template: Encrypted template from database
            
        Returns:
            True if templates match, False otherwise
        """
        try:
            decrypted_stored = self.decrypt(stored_encrypted_template)
            return template == decrypted_stored
        except Exception:
            return False


# Singleton instance
encryption_service = EncryptionService()
