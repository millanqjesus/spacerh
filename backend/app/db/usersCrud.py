from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash
from enum import Enum

def get_user_by_email(db: Session, email: str, tenant_id: int = None):
    """Busca si un email ya existe (global o por tenant)"""
    query = db.query(User).filter(User.email == email)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    return query.first()

def get_user_by_cpf(db: Session, cpf: str, tenant_id: int = None):
    """Busca si un CPF ya existe (global o por tenant)"""
    query = db.query(User).filter(User.cpf == cpf)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    return query.first()

def get_user_by_code(db: Session, code: str, tenant_id: int = None):
    """Busca si un code ya existe (global o por tenant)"""
    query = db.query(User).filter(User.code == code)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    return query.first()

def get_users(db: Session, skip: int = 0, limit: int = 100, tenant_id: int = None):
    """
    Obtiene lista de usuarios con orden específico:
    1. is_active = true (primero)
    2. first_name asc
    3. last_name asc
    Filtra por tenant_id si se proporciona.
    """
    query = db.query(User)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    return query.order_by(
        desc(User.is_active),
        User.first_name.asc(),
        User.last_name.asc()
    ).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate, tenant_id: int = None):
    """Crea un nuevo usuario en la BD"""
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        cpf=user.cpf,
        role=user.role.value if user.role else "contratado",
        code=None if user.code == "" else user.code,
        pix=None if user.pix == "" else user.pix,
        tenant_id=tenant_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# --- NUEVA FUNCION: ACTUALIZAR ---
def update_user(db: Session, user_id: int, user_update: UserUpdate, tenant_id: int = None):
    query = db.query(User).filter(User.id == user_id)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    db_user = query.first()
    if not db_user:
        return None

    # 2. Convertir esquema a diccionario excluyendo nulos
    update_data = user_update.model_dump(exclude_unset=True)

    # 3. Si viene password, lo hasheamos y lo cambiamos por el campo correcto de DB
    if 'password' in update_data:
        password = update_data.pop('password') # Sacamos la clave plana
        if password: # Solo si no está vacía
            update_data['hashed_password'] = get_password_hash(password)

    for key, value in update_data.items():
        if isinstance(value, Enum):
            setattr(db_user, key, value.value)
        elif key in ['code', 'pix'] and value == "":
            setattr(db_user, key, None)
        else:
            setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_tenant(db: Session, user_id: int, new_tenant_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    db_user.tenant_id = new_tenant_id
    db.commit()
    db.refresh(db_user)
    return db_user