import os


def build_database_url() -> str:
    user = os.environ.get("DB_USER", "app2_user")
    password = os.environ.get("DB_PASSWORD", "app2_password")
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "5432")
    name = os.environ.get("DB_NAME", "app2_db")

    return f"postgresql://{user}:{password}@{host}:{port}/{name}"


DATABASE_URL = build_database_url()
