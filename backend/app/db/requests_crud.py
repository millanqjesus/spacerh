from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from app.models.models import DailyRequest, WorkShift, ShiftAssignment, User, Company
from app.schemas.request_schemas import DailyRequestCreate, ShiftAssignmentCreate

# ... (get_daily_request y demas funciones de lectura se mantienen igual) ...
def get_daily_request(db: Session, request_id: int):
    return db.query(DailyRequest).options(
        joinedload(DailyRequest.shifts)
        .joinedload(WorkShift.assignments)
        .joinedload(ShiftAssignment.employee)
    ).filter(DailyRequest.id == request_id).first()

from sqlalchemy.sql import func, case

def get_payments_report(db: Session, start_date, end_date, company_id: int = None):
    # Calcular el monto final considerando descuentos si aplica
    amount_expr = case(
        (WorkShift.has_discount == True, WorkShift.payment_amount * (1 - WorkShift.discount_percentage / 100.0)),
        else_=WorkShift.payment_amount
    )
    
    query = db.query(
        User.first_name,
        User.last_name,
        func.sum(amount_expr).label("total_amount")
    ).join(ShiftAssignment, ShiftAssignment.employee_id == User.id)\
     .join(WorkShift, WorkShift.id == ShiftAssignment.shift_id)\
     .join(DailyRequest, DailyRequest.id == WorkShift.request_id)\
     .filter(
         and_(
             DailyRequest.request_date >= start_date,
             DailyRequest.request_date <= end_date,
             ShiftAssignment.status == 'PRESENTE'
         )
     )
    
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
        
    # Agrupar por colaborador
    query = query.group_by(User.id, User.first_name, User.last_name)\
                 .order_by(User.first_name, User.last_name)
                 
    results = query.all()
    
    return [
        {
            "employee_name": f"{r.first_name} {r.last_name}",
            "total_amount": float(r.total_amount or 0)
        }
        for r in results
    ]

def get_daily_requests(db: Session, skip: int = 0, limit: int = 100, company_id: int = None):
    query = db.query(DailyRequest)
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    return query.order_by(desc(DailyRequest.request_date)).offset(skip).limit(limit).all()

def create_daily_request(db: Session, request: DailyRequestCreate, user_id: int):
    db_request = DailyRequest(
        company_id=request.company_id,
        request_date=request.request_date,
        status="PENDIENTE",
        created_by=user_id,
        updated_by=user_id
    )
    db.add(db_request)
    db.flush() 

    for shift in request.shifts:
        final_discount = shift.discount_percentage if shift.has_discount else 0.0
        db_shift = WorkShift(
            request_id=db_request.id,
            start_time=shift.start_time,
            end_time=shift.end_time,
            payment_amount=shift.payment_amount,
            quantity=shift.quantity,
            has_discount=shift.has_discount,
            discount_percentage=final_discount,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_shift)

    db.commit()
    db.refresh(db_request)
    return db_request

# --- LÓGICA DE ASIGNACIÓN MEJORADA ---

def create_assignment(db: Session, assignment: ShiftAssignmentCreate, user_id: int):
    # 1. Obtener el turno para ver el límite (quantity)
    shift = db.query(WorkShift).filter(WorkShift.id == assignment.shift_id).first()
    if not shift:
        return "NOT_FOUND"

    # 2. Contar cuántos ya están asignados
    current_count = db.query(ShiftAssignment).filter(
        ShiftAssignment.shift_id == assignment.shift_id
    ).count()

    # 3. Validar si está lleno
    if current_count >= shift.quantity:
        return "FULL"

    # 4. Verificar si el empleado ya está en este turno
    exists = db.query(ShiftAssignment).filter(
        ShiftAssignment.shift_id == assignment.shift_id,
        ShiftAssignment.employee_id == assignment.employee_id
    ).first()
    
    if exists:
        return "EXISTS"

    # 5. Crear asignación
    db_assignment = ShiftAssignment(
        shift_id=assignment.shift_id,
        employee_id=assignment.employee_id,
        status="ASIGNADO",
        created_by=user_id,
        updated_by=user_id
    )
    db.add(db_assignment)
    db.commit()
    
    # 6. Recargar para traer los datos del empleado (necesario para la respuesta del frontend)
    db.refresh(db_assignment) 
    return db_assignment

    args = [assignment.shift_id, assignment.employee_id, "ASIGNADO", user_id, user_id]
    # ... (código anterior) ... esto no es lo que quiero reemplazar, voy a appendear al final

def delete_assignment(db: Session, assignment_id: int):
    # ... (contenido existente) ...
    db_assign = db.query(ShiftAssignment).filter(ShiftAssignment.id == assignment_id).first()
    if db_assign:
        db.delete(db_assign)
        db.commit()
        return True
    return False

def update_assignment_status(db: Session, assignment_id: int, status: str, user_id: int):
    db_assign = db.query(ShiftAssignment).filter(ShiftAssignment.id == assignment_id).first()
    if db_assign:
        db_assign.status = status
        db_assign.updated_by = user_id
        db.commit()
        db.refresh(db_assign)
    return db_assign

def update_daily_request_status(db: Session, request_id: int, status: str, user_id: int):
    db_request = db.query(DailyRequest).filter(DailyRequest.id == request_id).first()
    if db_request:
        db_request.status = status
        db_request.updated_by = user_id
        db.commit()
        db.refresh(db_request)
    return db_request

def delete_daily_request(db: Session, request_id: int):
    db_request = db.query(DailyRequest).filter(DailyRequest.id == request_id).first()
    if db_request:
        db.delete(db_request)
        db.commit()
        return True
    return False