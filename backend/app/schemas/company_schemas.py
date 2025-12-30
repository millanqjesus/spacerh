from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime

# Campos base compartidos
class CompanyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    tax_id: str = Field(..., min_length=6, max_length=20, description="CNPJ ou Identificador Fiscal")
    
    # Nuevos campos de contacto
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    
    contact_person: Optional[str] = Field(None, max_length=100)
    is_active: bool = True

# Para Crear (POST)
class CompanyCreate(CompanyBase):
    pass

# Para Actualizar (PUT/PATCH)
class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_person: Optional[str] = None
    is_active: Optional[bool] = None

# Para Responder (GET)
class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    updated_by: Optional[int]

    model_config = ConfigDict(from_attributes=True)