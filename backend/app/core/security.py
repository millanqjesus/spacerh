from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt # Importamos PyJWT
from app.core.config import settings # Importamos nuestra config

# CAMBIO: Cambiamos "bcrypt" por "argon2" en la lista de schemes.
# Argon2 gestiona memoria y CPU para evitar ataques de fuerza bruta por GPU.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Transforma texto plano a hash seguro usando Argon2"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si el texto plano coincide con el hash guardado"""
    return pwd_context.verify(plain_password, hashed_password)

# --- CREAR TOKEN ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Genera un JWT (Json Web Token) con los datos del usuario
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Si no se especifica, usa el default de la config (30 min)
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agregamos la fecha de expiración al contenido del token
    to_encode.update({"exp": expire})
    
    # Firmamos el token con nuestra clave secreta
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt