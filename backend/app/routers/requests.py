from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies import get_current_user
from app.schemas.schemas import UserResponse
from app.schemas.request_schemas import DailyRequestCreate, DailyRequestResponse
from app.db import requests_crud

router = APIRouter(prefix="/daily-requests", tags=["Solicitudes Diarias"])

@router.post("/", response_model=DailyRequestResponse, status_code=status.HTTP_201_CREATED)
def create_daily_request(
    request: DailyRequestCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Registra una nueva solicitud de diaria con sus turnos asociados.
    """
    return requests_crud.create_daily_request(db=db, request=request, user_id=current_user.id)

@router.get("/", response_model=List[DailyRequestResponse])
def read_daily_requests(
    skip: int = 0,
    limit: int = 100,
    company_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Lista las solicitudes de diaria. Puede filtrar por ID de empresa.
    """
    return requests_crud.get_daily_requests(db=db, skip=skip, limit=limit, company_id=company_id)

@router.get("/{request_id}", response_model=DailyRequestResponse)
def read_daily_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtiene el detalle completo de una solicitud específica.
    """
    db_request = requests_crud.get_daily_request(db=db, request_id=request_id)
    if db_request is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return db_request