from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.dependencies import get_current_user
from app.schemas.schemas import UserResponse
from app.schemas.company_schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.db import companies_crud

router = APIRouter(prefix="/companies", tags=["Empresas"])

@router.get("/", response_model=List[CompanyResponse])
def read_companies(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Listar todas las empresas (requiere login)"""
    return companies_crud.get_companies(db, skip=skip, limit=limit)

@router.get("/{company_id}", response_model=CompanyResponse)
def read_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    db_company = companies_crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return db_company

@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    company: CompanyCreate, 
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Crear una nueva empresa"""
    # Validar duplicados por Tax ID
    db_company = companies_crud.get_company_by_tax_id(db, tax_id=company.tax_id)
    if db_company:
        raise HTTPException(status_code=400, detail="Empresa com este ID Fiscal já existe.")
    
    return companies_crud.create_company(db=db, company=company, user_id=current_user.id)

@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int, 
    company_update: CompanyUpdate, 
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Actualizar datos de una empresa"""
    updated_company = companies_crud.update_company(
        db=db, 
        company_id=company_id, 
        company_update=company_update, 
        user_id=current_user.id
    )
    if not updated_company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return updated_company