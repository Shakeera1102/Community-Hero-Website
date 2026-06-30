"""Central config. All env vars and model names live here."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GOOGLE_API_KEY: str = ""
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGO: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24 * 7

    # Google AI Studio model names — change here to swap models
    VISION_MODEL: str = "gemini-2.5-flash"
    TEXT_MODEL: str = "gemini-2.5-flash"

    DB_PATH: str = "community_hero.db"
    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
