from fastapi import APIRouter, Depends
from app.schemas.schemas import UserResponse
from app.dependencies import get_current_user # Importamos al portero

router = APIRouter(prefix="/users", tags=["Usuarios"])

# Endpoint protegido movido aquí
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user