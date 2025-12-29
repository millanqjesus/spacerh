from sqlalchemy.orm import Session
from app.models.models import User
from app.schemas.schemas import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    """Busca si un email ya existe"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_cpf(db: Session, cpf: str):
    """Busca si un CPF ya existe"""
    return db.query(User).filter(User.cpf == cpf).first()

def create_user(db: Session, user: UserCreate):
    """Crea un nuevo usuario en la BD"""
    
    # 1. Hashear el password
    hashed_password = get_password_hash(user.password)
    
    # 2. Crear instancia del modelo DB
    # Mapeamos los campos del schema (Pydantic) al modelo (SQLAlchemy)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        cpf=user.cpf
        # created_at, updated_at, is_active y id se llenan solos por la DB
    )
    
    # 3. Guardar en DB
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Recargar para obtener el ID generado y fechas
    
    return db_user