from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from app.models.models import DailyRequest, WorkShift, ShiftAssignment, User, Company
from app.schemas.request_schemas import DailyRequestCreate, ShiftAssignmentCreate

def get_daily_request(db: Session, request_id: int):
    return db.query(DailyRequest).options(
        joinedload(DailyRequest.shifts)
        .joinedload(WorkShift.assignments)
        .joinedload(ShiftAssignment.employee)
    ).filter(DailyRequest.id == request_id).first()

from sqlalchemy.sql import func, case

def _get_employee_filter(user_id: int):
    """Helper para obtener filtro de empleado logueado."""
    return ShiftAssignment.employee_id == user_id

def get_payments_report(db: Session, start_date, end_date, company_id: int = None, user_id: int = None, role: str = None):
    amount_expr = case(
        (WorkShift.has_discount == True, WorkShift.payment_amount * (1 - WorkShift.discount_percentage / 100.0)),
        else_=WorkShift.payment_amount
    )
    
    query = db.query(
        User.code,
        User.first_name,
        User.last_name,
        User.pix,
        func.count(ShiftAssignment.id).label("shift_count"),
        func.avg(WorkShift.payment_amount).label("avg_payment"),
        func.sum(amount_expr).label("total_amount")
    ).join(ShiftAssignment, ShiftAssignment.employee_id == User.id)\
     .join(WorkShift, WorkShift.id == ShiftAssignment.shift_id)\
     .join(DailyRequest, DailyRequest.id == WorkShift.request_id)\
     .filter(
         and_(
             DailyRequest.request_date >= start_date,
             DailyRequest.request_date <= end_date,
             ShiftAssignment.status == 'PRESENTE',
             DailyRequest.status != 'CANCELADA'
         )
     )
    
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    
    if role == "contratado" and user_id:
        query = query.filter(ShiftAssignment.employee_id == user_id)
        
    query = query.group_by(User.id, User.code, User.first_name, User.last_name, User.pix)\
                 .order_by(User.first_name, User.last_name)
                 
    results = query.all()
    
    return [
        {
            "employee_code": r.code,
            "employee_name": f"{r.first_name} {r.last_name}",
            "shift_count": r.shift_count,
            "avg_payment": round(float(r.avg_payment or 0), 2),
            "total_amount": float(r.total_amount or 0),
            "employee_pix": r.pix
        }
        for r in results
    ]

def get_attendance_report(db: Session, start_date, end_date, company_id: int = None, user_id: int = None, role: str = None):
    amount_expr = case(
        (WorkShift.has_discount == True, WorkShift.payment_amount * (1 - WorkShift.discount_percentage / 100.0)),
        else_=WorkShift.payment_amount
    )

    query = db.query(
        DailyRequest.request_date,
        Company.name.label("company_name"),
        User.first_name,
        User.last_name,
        WorkShift.start_time,
        WorkShift.end_time,
        ShiftAssignment.status,
        amount_expr.label("final_amount")
    ).join(WorkShift, WorkShift.request_id == DailyRequest.id)\
     .join(ShiftAssignment, ShiftAssignment.shift_id == WorkShift.id)\
     .join(User, User.id == ShiftAssignment.employee_id)\
     .join(Company, Company.id == DailyRequest.company_id)\
     .filter(
         and_(
             DailyRequest.request_date >= start_date,
             DailyRequest.request_date <= end_date,
             DailyRequest.status != 'CANCELADA'
         )
     )
    
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    
    if role == "contratado" and user_id:
        query = query.filter(ShiftAssignment.employee_id == user_id)
        
    query = query.order_by(DailyRequest.request_date, User.first_name)
    results = query.all()
    
    return [
        {
            "date": r.request_date,
            "company_name": r.company_name,
            "employee_name": f"{r.first_name} {r.last_name}",
            "shift_time": f"{r.start_time.strftime('%H:%M')} - {r.end_time.strftime('%H:%M')}",
            "status": r.status,
            "amount": float(r.final_amount or 0)
        }
        for r in results
    ]

def get_dashboard_stats(db: Session, start_date, end_date, company_id: int = None, user_id: int = None, role: str = None):
    query = db.query(
        Company.name.label("company_name"),
        func.count(DailyRequest.id).label("request_count")
    ).join(Company, Company.id == DailyRequest.company_id)\
     .filter(
         and_(
             DailyRequest.request_date >= start_date,
             DailyRequest.request_date <= end_date,
             DailyRequest.status != 'CANCELADA'
         )
     )
    
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    
    if role == "contratado" and user_id:
        query = query.join(WorkShift, WorkShift.request_id == DailyRequest.id)\
                     .join(ShiftAssignment, ShiftAssignment.shift_id == WorkShift.id)\
                     .filter(ShiftAssignment.employee_id == user_id)
        
    query = query.group_by(Company.name).order_by(Company.name)
    results = query.all()
    
    return [
        {
            "company_name": r.company_name,
            "request_count": r.request_count
        }
        for r in results
    ]

def get_attendance_stats(db: Session, start_date, end_date, company_id: int = None, user_id: int = None, role: str = None):
    query = db.query(
        Company.name.label("company_name"),
        ShiftAssignment.status,
        func.count(ShiftAssignment.id).label("count")
    ).join(WorkShift, WorkShift.id == ShiftAssignment.shift_id)\
     .join(DailyRequest, DailyRequest.id == WorkShift.request_id)\
     .join(Company, Company.id == DailyRequest.company_id)\
     .filter(
         and_(
             DailyRequest.request_date >= start_date,
             DailyRequest.request_date <= end_date,
             DailyRequest.status != 'CANCELADA'
         )
     )
    
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    
    if role == "contratado" and user_id:
        query = query.filter(ShiftAssignment.employee_id == user_id)
        
    query = query.group_by(Company.name, ShiftAssignment.status).order_by(Company.name)
    results = query.all()
    
    return [
        {
            "company_name": r.company_name,
            "status": r.status,
            "count": r.count
        }
        for r in results
    ]





def get_daily_requests(db: Session, skip: int = 0, limit: int = 100, company_id: int = None, start_date: str = None, end_date: str = None, user_id: int = None, role: str = None):
    query = db.query(DailyRequest)
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    if start_date:
        query = query.filter(DailyRequest.request_date >= start_date)
    if end_date:
        query = query.filter(DailyRequest.request_date <= end_date)
    
    if role == "contratado" and user_id:
        query = query.join(WorkShift, WorkShift.request_id == DailyRequest.id)\
                     .join(ShiftAssignment, ShiftAssignment.shift_id == WorkShift.id)\
                     .filter(ShiftAssignment.employee_id == user_id)\
                     .distinct()
    
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
        
        if status == "CONFIRMADA":
            shifts_subquery = db.query(WorkShift.id).filter(WorkShift.request_id == request_id).subquery()
            db.query(ShiftAssignment).filter(
                ShiftAssignment.shift_id.in_(shifts_subquery),
                ShiftAssignment.status == "ASIGNADO"
            ).update(
                {"status": "FALTOU", "updated_by": user_id},
                synchronize_session=False
            )
            
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