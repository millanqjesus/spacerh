from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from app.db.database import SessionLocal
from app.core.config import settings
from app.db import usersCrud
from app.schemas.schemas import UserResponse # Para tipado

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = usersCrud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
        
    # Validamos también que el usuario esté activo
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
        
    return user

# --- NUEVA LÓGICA DE ROLES ---

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: UserResponse = Depends(get_current_user)):
        """
        Esta función se ejecuta automáticamente antes del endpoint.
        Revisa si el rol del usuario está en la lista permitida.
        """
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="No tienes permisos suficientes para realizar esta acción"
            )
        return user

# Creamos instancias listas para usar en tus rutas
allow_admin = RoleChecker(["admin"])
allow_manager = RoleChecker(["manager", "admin"]) # El admin también puede hacer cosas de manager