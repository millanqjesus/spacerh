from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime
import re

# --- CLASE DE ENTRADA (Para crear usuario) ---
class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    cpf: str = Field(..., min_length=11, max_length=14)
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password robusto")

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('A senha deve ter pelo menos 6 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Deve ter letra maiúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('Deve ter letra minúscula')
        if not re.search(r'\d', v):
            raise ValueError('Deve ter número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Deve ter caractere especial')
        return v

# --- CLASE DE SALIDA (Para responder al frontend) ---
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    cpf: str
    is_active: bool
    created_at: datetime
    # updated_at: datetime # Opcional si quieres devolverla también

    # Configuración para leer desde SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# --- CLASE PARA EL TOKEN ---
class Token(BaseModel):
    access_token: str
    token_type: str