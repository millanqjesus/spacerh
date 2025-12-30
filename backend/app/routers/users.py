from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.schemas.schemas import UserResponse, UserUpdate
from app.db import usersCrud
from app.dependencies import get_current_user, get_db

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/", response_model=List[UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Retorna la lista de todos los usuarios registrados.
    Requiere estar logueado (current_user).
    """
    return usersCrud.get_users(db, skip=skip, limit=limit)

# Endpoint protegido movido aquí
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

# --- ENDPOINT: Actualizar Usuario ---
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Actualiza los datos de un usuario existente.
    """
    # Aquí podrías validar roles: if current_user.role != 'admin'...
    
    updated_user = usersCrud.update_user(db, user_id=user_id, user_update=user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return updated_user