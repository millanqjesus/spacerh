from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.models.models import DailyRequest, WorkShift
from app.schemas.request_schemas import DailyRequestCreate, DailyRequestUpdate

def get_daily_request(db: Session, request_id: int):
    """Obtiene una solicitud específica con sus turnos cargados"""
    return db.query(DailyRequest).options(
        joinedload(DailyRequest.shifts) # Carga ansiosa de los turnos relacionados
    ).filter(DailyRequest.id == request_id).first()

def get_daily_requests(db: Session, skip: int = 0, limit: int = 100, company_id: int = None):
    """Lista las solicitudes, opcionalmente filtradas por empresa"""
    query = db.query(DailyRequest)
    
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
        
    return query.order_by(
        desc(DailyRequest.request_date)
    ).offset(skip).limit(limit).all()

def create_daily_request(db: Session, request: DailyRequestCreate, user_id: int):
    """
    Crea una Solicitud Diaria y todos sus Turnos en una sola transacción.
    """
    # 1. Crear la Cabecera (DailyRequest)
    db_request = DailyRequest(
        company_id=request.company_id,
        request_date=request.request_date,
        status="PENDIENTE",
        created_by=user_id,
        updated_by=user_id
    )
    
    db.add(db_request)
    db.flush() # Importante: Genera el ID de la solicitud sin cerrar la transacción

    # 2. Crear los Detalles (WorkShifts)
    for shift in request.shifts:
        db_shift = WorkShift(
            request_id=db_request.id, # Usamos el ID generado arriba
            start_time=shift.start_time,
            end_time=shift.end_time,
            payment_amount=shift.payment_amount,
            quantity=shift.quantity,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_shift)

    # 3. Confirmar todo junto
    db.commit()
    db.refresh(db_request)
    return db_request

def update_daily_request_status(db: Session, request_id: int, status: str, user_id: int):
    """Actualiza solo el estado de la solicitud"""
    db_request = db.query(DailyRequest).filter(DailyRequest.id == request_id).first()
    if db_request:
        db_request.status = status
        db_request.updated_by = user_id
        db.commit()
        db.refresh(db_request)
    return db_request