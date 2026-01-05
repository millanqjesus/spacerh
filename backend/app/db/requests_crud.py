from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.models.models import DailyRequest, WorkShift, ShiftAssignment, User
from app.schemas.request_schemas import DailyRequestCreate, ShiftAssignmentCreate

def get_daily_request(db: Session, request_id: int):
    """
    Obtiene una solicitud con sus turnos Y los empleados asignados a esos turnos.
    """
    return db.query(DailyRequest).options(
        # Carga los turnos
        joinedload(DailyRequest.shifts)
        # Y dentro de cada turno, carga las asignaciones y los datos del empleado
        .joinedload(WorkShift.assignments)
        .joinedload(ShiftAssignment.employee)
    ).filter(DailyRequest.id == request_id).first()

# ... (get_daily_requests y create_daily_request se mantienen igual) ...
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

# --- NUEVA LÓGICA DE ASIGNACIÓN ---

def create_assignment(db: Session, assignment: ShiftAssignmentCreate, user_id: int):
    # 1. Verificar si ya está asignado a ese turno (evitar duplicados)
    exists = db.query(ShiftAssignment).filter(
        ShiftAssignment.shift_id == assignment.shift_id,
        ShiftAssignment.employee_id == assignment.employee_id
    ).first()
    
    if exists:
        return None # O lanzar excepción

    # 2. Crear asignación
    db_assignment = ShiftAssignment(
        shift_id=assignment.shift_id,
        employee_id=assignment.employee_id,
        status="ASIGNADO",
        created_by=user_id,
        updated_by=user_id
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def delete_assignment(db: Session, assignment_id: int):
    db_assign = db.query(ShiftAssignment).filter(ShiftAssignment.id == assignment_id).first()
    if db_assign:
        db.delete(db_assign)
        db.commit()
        return True
    return False