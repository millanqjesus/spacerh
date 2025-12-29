# app/core/config.py
import os

class Settings:
    PROJECT_NAME: str = "Backend Space"
    PROJECT_VERSION: str = "1.0.0"

    # CONFIGURACIÓN DE SEGURIDAD
    # En producción, esto se debe leer de variables de entorno con os.getenv()
    # Para desarrollo, puedes poner una cadena larga y aleatoria aquí.
    # Puedes generar una corriendo en terminal: openssl rand -hex 32
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    
    ALGORITHM: str = "HS256" # Algoritmo de encriptación estándar
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # El token durará 30 minutos
    
    # --- CONFIGURACIÓN REDIS ---
    REDIS_HOST: str = "localhost" # Porque estás corriendo Docker en tu máquina
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

settings = Settings()