from sqlalchemy import Column, Integer, String, Boolean, text, DateTime
from sqlalchemy.sql import func
from app.db.database import Base 

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    cpf = Column(String(14), unique=True, index=True, nullable=False)
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    is_active = Column(Boolean, server_default=text('true'), nullable=False)

    # Rol del usuario
    role = Column(String(20), server_default='admin', nullable=False)

    # Campos de Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)