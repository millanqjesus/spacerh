# test_insert.py
import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.models import User

def test_full_user():
    db = SessionLocal()
    try:
        print("👤 Creando usuario COMPLETO (con Nombre, Apellido y CPF)...")
        
        user = User(
            first_name="Juan",
            last_name="Pérez",
            cpf="123.456.789-00",
            email="juan.perez@test.com", 
            hashed_password="hash_super_secreto"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ ¡Usuario creado con éxito!")
        print(f"   ID: {user.id}")
        print(f"   Nombre: {user.first_name} {user.last_name}")
        print(f"   CPF: {user.cpf}")
        print(f"   Creado el: {user.created_at}")

    except Exception as e:
        print(f"❌ ERROR: {e}")
        # Tip: Si te dice "unique constraint", es porque ya existe ese email o CPF
    finally:
        db.close()

if __name__ == "__main__":
    test_full_user()