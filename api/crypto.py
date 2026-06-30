import json
import os
import secrets
from typing import Union

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _key() -> bytes:
    raw = os.environ.get("ENCRYPTION_KEY_HEX", "")
    if len(raw) != 64:
        raise RuntimeError(
            "ENCRYPTION_KEY_HEX must be exactly 64 hex characters (32 bytes for AES-256)"
        )
    return bytes.fromhex(raw)


def encrypt(data: Union[str, list, dict]) -> bytes:
    """Encrypt a string, list, or dict to bytes (nonce‖ciphertext)."""
    if not isinstance(data, str):
        data = json.dumps(data, ensure_ascii=False)
    nonce = secrets.token_bytes(12)  # 96-bit nonce for GCM
    ct = AESGCM(_key()).encrypt(nonce, data.encode("utf-8"), None)
    return nonce + ct


def decrypt_str(blob: bytes) -> str:
    """Decrypt bytes back to a UTF-8 string."""
    nonce, ct = blob[:12], blob[12:]
    return AESGCM(_key()).decrypt(nonce, ct, None).decode("utf-8")


def decrypt_json(blob: bytes) -> Union[dict, list]:
    """Decrypt bytes and deserialise as JSON."""
    return json.loads(decrypt_str(blob))
