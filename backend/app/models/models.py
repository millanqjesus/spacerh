from sqlalchemy import Column, Integer, String, Boolean, text, DateTime, ForeignKey, Date, Float
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
    role = Column(String(20), server_default='user', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Company(Base):
    __tablename__ = "companies"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    tax_id = Column(String(20), unique=True, index=True, nullable=False)
    phone = Column(String(20)) 
    email = Column(String(100))
    contact_person = Column(String(100))
    is_active = Column(Boolean, server_default=text('true'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

# --- TABLA: SOLICITUDES DE DIARIA (Cabecera) ---
class DailyRequest(Base):
    __tablename__ = "daily_requests"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    
    # Relación con Empresa (Cliente)
    company_id = Column(Integer, ForeignKey('business.companies.id'), nullable=False)
    
    # Datos del Evento
    request_date = Column(Date, nullable=False) # Fecha del servicio (solo día)
    status = Column(String(20), server_default='PENDIENTE', nullable=False) # PENDIENTE, CONFIRMADA, FINALIZADA, CANCELADA
    
    # Auditoría Completa (Solicitado)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)


# --- TABLA: TURNOS DE TRABAJO (Detalle) ---
class WorkShift(Base):
    __tablename__ = "work_shifts"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey('business.daily_requests.id'), nullable=False)
    
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    payment_amount = Column(Float, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    # --- NUEVOS CAMPOS SOLICITADOS ---
    has_discount = Column(Boolean, default=False, nullable=False)
    discount_percentage = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

# --- TABLA: ASIGNACIÓN DE EMPLEADOS A TURNOS ---
class ShiftAssignment(Base):
    __tablename__ = "shift_assignments"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    
    # Relación con el Turno
    shift_id = Column(Integer, ForeignKey('business.work_shifts.id'), nullable=False)
    
    # Relación con el Empleado (Usuario con rol trabajador)
    employee_id = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    
    # Estado de la asignación (ej: ASIGNADO, CONFIRMADO, FINALIZADO, AUSENTE)
    status = Column(String(20), server_default='ASIGNADO', nullable=False)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)