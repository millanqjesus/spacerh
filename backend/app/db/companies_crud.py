from sqlalchemy.orm import Session
from app.models.models import Company
from app.schemas.company_schemas import CompanyCreate, CompanyUpdate

def get_company(db: Session, company_id: int):
    return db.query(Company).filter(Company.id == company_id).first()

def get_company_by_tax_id(db: Session, tax_id: str):
    return db.query(Company).filter(Company.tax_id == tax_id).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Company).order_by(Company.name.asc()).offset(skip).limit(limit).all()

def create_company(db: Session, company: CompanyCreate, user_id: int):
    db_company = Company(
        name=company.name,
        tax_id=company.tax_id,
        phone=company.phone,      # Nuevo campo
        email=company.email,      # Nuevo campo
        contact_person=company.contact_person,
        is_active=company.is_active,
        created_by=user_id,
        updated_by=user_id
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(db: Session, company_id: int, company_update: CompanyUpdate, user_id: int):
    db_company = get_company(db, company_id)
    if not db_company:
        return None
    
    update_data = company_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_company, key, value)

    # Actualizamos auditoría
    db_company.updated_by = user_id
    
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company