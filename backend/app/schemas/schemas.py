from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime
from enum import Enum
from typing import Optional
import re
from uuid import UUID

# Definimos los roles permitidos para tener orden
class UserRole(str, Enum):
    ADMIN = "admin"
    LIDER = "lider"
    CONTRATADO = "contratado"

# --- CLASE DE ENTRADA ---
class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    cpf: str = Field(..., min_length=11, max_length=14)
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password robusto")
    role: Optional[UserRole] = UserRole.CONTRATADO
    code: Optional[str] = Field(None, max_length=50)
    pix: Optional[str] = Field(None, max_length=255)

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('A senha deve ter pelo menos 6 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Deve conter letra maiúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('Deve conter letra minúscula')
        if not re.search(r'\d', v):
            raise ValueError('Deve conter número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Deve conter caractere especial')
        return v

class PublicUserCreate(UserCreate):
    tenant_uuid: Optional[UUID] = None

# --- CLASE DE ACTUALIZACIÓN (Update) ---
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    code: Optional[str] = Field(None, max_length=50)
    pix: Optional[str] = Field(None, max_length=255)

# --- CLASE DE SALIDA ---
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    cpf: str
    is_active: bool
    role: str
    code: Optional[str] = None
    pix: Optional[str] = None
    tenant_uuid: Optional[UUID] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    tenant_uuid: Optional[str] = None

class UserTenantChange(BaseModel):
    user_id: int
    tenant_id: int