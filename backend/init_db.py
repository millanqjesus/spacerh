from app.db.database import engine, Base
import app.models.models # Importamos para que SQLAlchemy reconozca el modelo User

def init_db():
    print("🔄 Intentando conectar a Docker y crear tablas...")
    try:
        print("🗑️  Borrando tablas existentes en 'auth'...")
        Base.metadata.drop_all(bind=engine)
        print("   -> Tablas borradas.")
        # Esto crea las tablas definidas en models.py si no existen
        Base.metadata.create_all(bind=engine)
        print("✅ ¡ÉXITO! Tablas creadas en PostgreSQL.")
        print("   Tu backend ya tiene memoria permanente.")
    except Exception as e:
        print("❌ ERROR DE CONEXIÓN:")
        print(f"   {e}")
        print("\n   👉 Pista: Revisa usuario, password y puerto en database.py")

if __name__ == "__main__":
    init_db()