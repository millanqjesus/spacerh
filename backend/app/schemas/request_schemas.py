from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, date

# --- Esquema Simple de Usuario (Para anidar en respuestas) ---
class EmployeeSimple(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)

# --- 1. ASIGNACIONES (Hijo de Turno) ---
class ShiftAssignmentBase(BaseModel):
    status: str = "ASIGNADO"

class ShiftAssignmentCreate(ShiftAssignmentBase):
    shift_id: int
    employee_id: int

class ShiftAssignmentUpdate(BaseModel):
    status: str

class ShiftAssignmentResponse(ShiftAssignmentBase):
    id: int
    shift_id: int
    employee_id: int
    
    # ⚠️ CAMBIO 1: Incluir objeto empleado completo
    employee: Optional[EmployeeSimple] = None 
    
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- 2. TURNOS (Hijo de Solicitud) ---
class WorkShiftBase(BaseModel):
    start_time: datetime
    end_time: datetime
    payment_amount: float = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0)
    has_discount: bool = False
    discount_percentage: Optional[float] = 0.0

class WorkShiftCreate(WorkShiftBase):
    pass

class WorkShiftResponse(WorkShiftBase):
    id: int
    request_id: int
    
    # ⚠️ CAMBIO 2: Incluir lista de asignaciones
    assignments: List[ShiftAssignmentResponse] = [] 
    
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- 3. SOLICITUDES DIARIAS (Padre) ---
class DailyRequestBase(BaseModel):
    request_date: date
    status: str = "PENDIENTE"

class DailyRequestCreate(DailyRequestBase):
    company_id: int
    shifts: List[WorkShiftCreate] = []

class DailyRequestUpdate(BaseModel):
    request_date: Optional[date] = None
    status: Optional[str] = None

class DailyRequestResponse(DailyRequestBase):
    id: int
    company_id: int
    created_at: datetime
    
    # Incluye lista de turnos (que ahora incluyen asignaciones)
    shifts: List[WorkShiftResponse] = [] 

    model_config = ConfigDict(from_attributes=True)