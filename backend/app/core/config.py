from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    azure_face_key: str = ""
    azure_face_endpoint: str = ""
    app_api_key: str = ""
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
