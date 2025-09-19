from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ServiceDesk Plus"
    DEBUG: bool = True

    # POSTGRES settings
    POSTGRES_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")
    POSTGRES_DB_NAME: str = Field(..., env="POSTGRES_DB_NAME")
    POSTGRES_USER: str = Field(..., env="POSTGRES_USER")
    POSTGRES_PORT: int = Field(..., env="POSTGRES_PORT")
    POSTGRES_HOST: str = Field("localhost", env="POSTGRES_HOST")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB_NAME}"
        )

    # JWT
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(..., env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(..., env="ACCESS_TOKEN_EXPIRE_MINUTES")
    WS_TOKEN_EXPIRE_SECONDS: int = Field(..., env="WS_TOKEN_EXPIRE_SECONDS")

    #TELEGRAM API
    TELEGRAM_BOT_TOKEN: str | None = None
    BOT_SERVICE_SECRET: str = Field(..., env="BOT_SERVICE_SECRET")

    # Frontend
    FRONTEND_PORT: int = Field(3000, env="PORT")
    FRONTEND_HOST: str = Field("127.0.0.1", env="HOST")
    FRONTEND_DEBUG: bool = Field(True, env="DEBUG")

    # Backend
    BACKEND_PORT: int = Field(8000, env="PORT")
    BACKEND_HOST: str = Field("0.0.0.0", env="HOST")
    BACKEND_DEBUG: bool = Field(True, env="DEBUG")

    # CORS
    ALLOW_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: List[str] = ["*"]
    ALLOW_HEADERS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()