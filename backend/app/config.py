from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_user: str = "worktrack"
    db_password: str = "worktrack"
    db_name: str = "worktrack"
    db_host: str = "localhost"
    db_port: int = 5432

    jwt_secret: str = "dev-secret"
    app_tz: str = "Europe/Moscow"

    admin_email: str = "admin@worktrack.ru"
    admin_password: str = "admin"

    office_lat: float = 55.7558
    office_lng: float = 37.6173
    office_radius_m: int = 200

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
