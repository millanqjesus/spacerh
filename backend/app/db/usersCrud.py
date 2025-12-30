from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    """Busca si un email ya existe"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_cpf(db: Session, cpf: str):
    """Busca si un CPF ya existe"""
    return db.query(User).filter(User.cpf == cpf).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene lista de usuarios con orden específico:
    1. is_active = true (primero)
    2. first_name asc
    3. last_name asc
    """
    return db.query(User).order_by(
        desc(User.is_active), # True (1) va antes que False (0)
        User.first_name.asc(),
        User.last_name.asc()
    ).offset(skip).limit(limit).all()

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

# --- NUEVA FUNCION: ACTUALIZAR ---
def update_user(db: Session, user_id: int, user_update: UserUpdate):
    # 1. Buscar usuario
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    # 2. Convertir esquema a diccionario excluyendo nulos
    update_data = user_update.model_dump(exclude_unset=True)

    # 3. Si viene password, lo hasheamos y lo cambiamos por el campo correcto de DB
    if 'password' in update_data:
        password = update_data.pop('password') # Sacamos la clave plana
        if password: # Solo si no está vacía
            update_data['hashed_password'] = get_password_hash(password)

    # 4. Actualizar campos dinámicamente
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user