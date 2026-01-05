from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.models.models import DailyRequest, WorkShift
from app.schemas.request_schemas import DailyRequestCreate

def get_daily_request(db: Session, request_id: int):
    return db.query(DailyRequest).options(
        joinedload(DailyRequest.shifts)
    ).filter(DailyRequest.id == request_id).first()

def get_daily_requests(db: Session, skip: int = 0, limit: int = 100, company_id: int = None):
    query = db.query(DailyRequest)
    if company_id:
        query = query.filter(DailyRequest.company_id == company_id)
    return query.order_by(desc(DailyRequest.request_date)).offset(skip).limit(limit).all()

def create_daily_request(db: Session, request: DailyRequestCreate, user_id: int):
    # 1. Crear Cabecera
    db_request = DailyRequest(
        company_id=request.company_id,
        request_date=request.request_date,
        status="PENDIENTE",
        created_by=user_id,
        updated_by=user_id
    )
    
    db.add(db_request)
    db.flush() 

    # 2. Crear Detalles (Turnos) con nuevos campos
    for shift in request.shifts:
        # Si no tiene descuento, aseguramos que el porcentaje sea 0
        final_discount = shift.discount_percentage if shift.has_discount else 0.0
        
        db_shift = WorkShift(
            request_id=db_request.id,
            start_time=shift.start_time,
            end_time=shift.end_time,
            payment_amount=shift.payment_amount,
            quantity=shift.quantity,
            
            # Nuevos campos
            has_discount=shift.has_discount,
            discount_percentage=final_discount,
            
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_shift)

    db.commit()
    db.refresh(db_request)
    return db_request

def update_daily_request_status(db: Session, request_id: int, status: str, user_id: int):
    db_request = db.query(DailyRequest).filter(DailyRequest.id == request_id).first()
    if db_request:
        db_request.status = status
        db_request.updated_by = user_id
        db.commit()
        db.refresh(db_request)
    return db_request