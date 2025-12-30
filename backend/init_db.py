import sys
import os
from sqlalchemy import text

# Configuración de rutas
sys.path.append(os.getcwd())

from app.db.database import engine, Base
from app.models import models 

def reset_db():
    print("🔄 Conectando a PostgreSQL...")
    
    try:
        with engine.connect() as connection:
            # 1. Crear esquema de Autenticación
            connection.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))
            
            # 2. Crear esquema de Negocio (NUEVO)
            connection.execute(text("CREATE SCHEMA IF NOT EXISTS business"))
            
            connection.commit()
            print("✅ Esquemas 'auth' y 'business' verificados.")

        # 3. BORRAR TABLAS (Opcional, solo para desarrollo/reset)
        # print("🗑️  Borrando tablas existentes...")
        # Base.metadata.drop_all(bind=engine)

        # 4. CREAR TABLAS
        print("🏗️  Creando/Actualizando tablas...")
        Base.metadata.create_all(bind=engine)
        print("✅ ¡ÉXITO! Base de datos lista.")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    reset_db()