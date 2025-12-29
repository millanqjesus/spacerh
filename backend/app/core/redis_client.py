import redis
from app.core.config import settings

# Creamos el pool de conexiones (es más eficiente que abrir y cerrar a cada rato)
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True # Importante: Para recibir strings en vez de bytes
)

def get_redis_client():
    """Retorna una instancia de cliente Redis"""
    return redis.Redis(connection_pool=redis_pool)