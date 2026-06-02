from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import get_settings

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def verify_api_key(key: str = Security(api_key_header)) -> str:
    settings = get_settings()
    # Si no hay APP_API_KEY configurada, permite todo (modo dev)
    if not settings.app_api_key:
        return key or "dev"
    if key != settings.app_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida o ausente",
        )
    return key
