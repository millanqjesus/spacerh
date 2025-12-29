from sqlalchemy import Column, Integer, String, Boolean, text, DateTime
from sqlalchemy.sql import func # <--- Importante para usar funciones SQL como now()
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    cpf = Column(String(14), unique=True, index=True, nullable=False) # CPF (Unique para que no se repita)
    first_name = Column(String(100), nullable=False)  # Nombre
    last_name = Column(String(100), nullable=False)   # Apellido
    hashed_password = Column(String, nullable=False)
    # Campo para saber si el usuario está activo (útil para baneos permanentes)
    is_active = Column(Boolean, server_default=text('true'), nullable=False)
    # created_at: Se llena solo al crear el registro (server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # updated_at: Se llena al crear Y se actualiza solo cuando hay cambios (onupdate=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # NOTA: Los intentos fallidos y bloqueos temporales los manejaremos 
    # en Redis (caché) para no saturar esta base de datos, 
    # pero el usuario base vive aquí.