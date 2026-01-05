from sqlalchemy import Column, Integer, String, Boolean, text, DateTime, ForeignKey, Date, Float
from sqlalchemy.orm import relationship 
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

    # ⚠️ CORRECCIÓN: Especificamos explícitamente qué llave foránea usar
    # "ShiftAssignment.employee_id" le dice a SQLAlchemy que ignore created_by/updated_by para esta relación
    assignments = relationship("ShiftAssignment", back_populates="employee", foreign_keys="ShiftAssignment.employee_id")

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

class DailyRequest(Base):
    __tablename__ = "daily_requests"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('business.companies.id'), nullable=False)
    request_date = Column(Date, nullable=False)
    status = Column(String(20), server_default='PENDIENTE', nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, ForeignKey('auth.users.id'), nullable=False)
    updated_by = Column(Integer, ForeignKey('auth.users.id'), nullable=True)

    shifts = relationship("WorkShift", back_populates="request", cascade="all, delete-orphan")

class WorkShift(Base):
    __tablename__ = "work_shifts"
    __table_args__ = {"schema": "business", "extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey('business.daily_requests.id'), nullable=False)
    
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