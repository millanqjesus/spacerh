from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.schemas.schemas import UserCreate, UserResponse, Token
from app.db import usersCrud
from app.core.security import verify_password, create_access_token
from app.core.redis_client import get_redis_client
from app.core.config import settings
from app.dependencies import get_db # Importamos desde el archivo nuevo

# Creamos el Router (es como una mini-app)
router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = usersCrud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="O e-mail já está cadastrado")
    
    db_cpf = usersCrud.get_user_by_cpf(db, cpf=user.cpf)
    if db_cpf:
        raise HTTPException(status_code=400, detail="O CPF já está cadastrado")

    return usersCrud.create_user(db=db, user=user)

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Redis Check
    r = get_redis_client()
    redis_key = f"failed_attempts:{form_data.username}" 
    failed_attempts = r.get(redis_key)
    
    if failed_attempts and int(failed_attempts) >= 5:
        raise HTTPException(status_code=400, detail="Usuário bloqueado temporariamente.")

    # 2. DB Check
    user = usersCrud.get_user_by_email(db, email=form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        new_attempts = r.incr(redis_key)
        if new_attempts == 1:
            r.expire(redis_key, 300) 
        raise HTTPException(status_code=400, detail=f"Credenciais incorretas. Tentativas: {new_attempts}/5")

    # 3. Success
    r.delete(redis_key)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}