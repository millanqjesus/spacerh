from sqlalchemy import Column, Integer, String, Boolean, text, DateTime, ForeignKey, Date, Float, BigInteger
from sqlalchemy.orm import relationship 
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from app.db.database import Base 

class Tenant(Base):
    __tablename__ = "tenants"
    __table_args__ = {"schema": "core", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), nullable=False, default=lambda: str(uuid4()))
    name = Column(String(150), nullable=False)
    document = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

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
    code = Column(String(50), nullable=True)
    pix = Column(String(255), nullable=True)
    tenant_id = Column(BigInteger, ForeignKey('core.tenants.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ⚠️ CORRECCIÓN: Especificamos explícitamente qué llave foránea usar
    # "ShiftAssignment.employee_id" le dice a SQLAlchemy que ignore created_by/updated_by para esta relación
    assignments = relationship("ShiftAssignment", back_populates="employee", foreign_keys="ShiftAssignment.employee_id")
    tenant = relationship("Tenant", foreign_keys=[tenant_id], lazy="joined")

    @property
    def tenant_uuid(self):
        return self.tenant.uuid if self.tenant else None

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
    tenant_id = Column(BigInteger, ForeignKey('core.tenants.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

    tenant = relationship("Tenant", foreign_keys=[tenant_id], lazy="joined")

    @property
    def tenant_uuid(self):
        return self.tenant.uuid if self.tenant else None

class DailyRequestStatus(Base):
    __tablename__ = "daily_request_status"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

    requests = relationship("DailyRequest", back_populates="status_rel")

class DailyRequest(Base):
    __tablename__ = "daily_requests"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('business.companies.id'), nullable=False)
    request_date = Column(Date, nullable=False)
    
    # FK a daily_request_status
    status_id = Column(Integer, ForeignKey('business.daily_request_status.id'), nullable=False)
    tenant_id = Column(BigInteger, ForeignKey('core.tenants.id'), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

    status_rel = relationship("DailyRequestStatus", back_populates="requests", lazy="joined")
    shifts = relationship("WorkShift", back_populates="request", cascade="all, delete-orphan")

    @property
    def status(self):
        return self.status_rel.code if self.status_rel else None

class WorkShift(Base):
    __tablename__ = "work_shifts"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey('business.daily_requests.id'), nullable=False)
    tenant_id = Column(BigInteger, ForeignKey('core.tenants.id'), nullable=True)
    
    start_time = Column(DateTime(timezone=False), nullable=False)
    end_time = Column(DateTime(timezone=False), nullable=False)
    
    payment_amount = Column(Float, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    
    has_discount = Column(Boolean, default=False, nullable=False)
    discount_percentage = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)
    
    request = relationship("DailyRequest", back_populates="shifts")
    
    assignments = relationship("ShiftAssignment", back_populates="shift", cascade="all, delete-orphan")

class ShiftAssignment(Base):
    __tablename__ = "shift_assignments"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey('business.work_shifts.id'), nullable=False)
    tenant_id = Column(BigInteger, ForeignKey('core.tenants.id'), nullable=True)
    
    # Esta es la llave que nos interesa para la relación principal
    employee_id = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    
    status = Column(String(20), server_default='ASIGNADO', nullable=False)
    
    # Estas llaves causaban la ambigüedad
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

    shift = relationship("WorkShift", back_populates="assignments")
    
    # ⚠️ CORRECCIÓN: Aquí también especificamos foreign_keys=[employee_id]
    employee = relationship("User", back_populates="assignments", foreign_keys=[employee_id])