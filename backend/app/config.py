from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./ticketmeter.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    SEATGEEK_CLIENT_ID: str = ""
    SEATGEEK_SECRET: str = ""
    TICKETMASTER_API_KEY: str = ""

    NEWSAPI_KEY: str = ""

    RESEND_API_KEY: str = ""

    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_CLAIMS_EMAIL: str = "admin@ticketmeter.app"

    ENVIRONMENT: str = "development"
    USE_MOCK_DATA: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
