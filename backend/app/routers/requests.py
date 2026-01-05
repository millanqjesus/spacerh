from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies import get_current_user
from app.schemas.schemas import UserResponse
from app.schemas.request_schemas import DailyRequestCreate, DailyRequestResponse, ShiftAssignmentCreate, ShiftAssignmentResponse
from app.db import requests_crud

router = APIRouter(prefix="/daily-requests", tags=["Solicitudes Diarias"])

@router.post("/", response_model=DailyRequestResponse, status_code=status.HTTP_201_CREATED)
def create_daily_request(request: DailyRequestCreate, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    return requests_crud.create_daily_request(db=db, request=request, user_id=current_user.id)

@router.get("/", response_model=List[DailyRequestResponse])
def read_daily_requests(skip: int = 0, limit: int = 100, company_id: Optional[int] = None, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    return requests_crud.get_daily_requests(db=db, skip=skip, limit=limit, company_id=company_id)

@router.get("/{request_id}", response_model=DailyRequestResponse)
def read_daily_request(request_id: int, db: Session = Depends(get_db), current_user: UserResponse = Depends(get_current_user)):
    db_request = requests_crud.get_daily_request(db=db, request_id=request_id)
    if db_request is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return db_request

# --- ASIGNACIONES ---

@router.post("/assignments", response_model=ShiftAssignmentResponse)
def assign_employee(
    assignment: ShiftAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    result = requests_crud.create_assignment(db=db, assignment=assignment, user_id=current_user.id)
    
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    if result == "FULL":
        raise HTTPException(status_code=400, detail="El turno ya está completo (Cupos llenos)")
    if result == "EXISTS":
        raise HTTPException(status_code=400, detail="El empleado ya está asignado a este turno")
        
    return result

@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    success = requests_crud.delete_assignment(db=db, assignment_id=assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return None