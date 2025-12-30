from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, date

# --- 1. TURNOS (Work Shifts) ---
class WorkShiftBase(BaseModel):
    start_time: datetime
    end_time: datetime
    payment_amount: float = Field(..., gt=0, description="Valor a pagar por este turno")
    quantity: int = Field(default=1, gt=0, description="Cantidad de personas necesarias")

class WorkShiftCreate(WorkShiftBase):
    pass

class WorkShiftResponse(WorkShiftBase):
    id: int
    request_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    updated_by: Optional[int]

    model_config = ConfigDict(from_attributes=True)

# --- 2. ASIGNACIONES (Shift Assignments) ---
class ShiftAssignmentBase(BaseModel):
    status: str = "ASIGNADO"

class ShiftAssignmentCreate(ShiftAssignmentBase):
    shift_id: int
    employee_id: int

class ShiftAssignmentUpdate(BaseModel):
    status: Optional[str] = None

class ShiftAssignmentResponse(ShiftAssignmentBase):
    id: int
    shift_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    updated_by: Optional[int]

    model_config = ConfigDict(from_attributes=True)

# --- 3. SOLICITUDES DIARIAS (Daily Requests - Cabecera) ---
class DailyRequestBase(BaseModel):
    request_date: date
    status: str = "PENDIENTE"

class DailyRequestCreate(DailyRequestBase):
    company_id: int
    # ⚠️ Clave: Aquí permitimos recibir una lista de turnos dentro de la solicitud
    shifts: List[WorkShiftCreate] = []

class DailyRequestUpdate(BaseModel):
    request_date: Optional[date] = None
    status: Optional[str] = None
    # No permitimos cambiar la empresa normalmente, pero se podría agregar

class DailyRequestResponse(DailyRequestBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    created_by: int
    updated_by: Optional[int]
    
    # Nota: Si agregamos la relación en SQLAlchemy, podríamos descomentar esto:
    # shifts: List[WorkShiftResponse] = [] 

    model_config = ConfigDict(from_attributes=True)