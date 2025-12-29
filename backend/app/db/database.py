from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ⚠️ IMPORTANTE: Ajusta estos datos según tu contenedor Docker
# Formato: postgresql://usuario:password@host:puerto/nombre_base_datos
# Si tu docker corre en local, el host suele ser "localhost"
SQLALCHEMY_DATABASE_URL = "postgresql://root:.Clent4321.@127.0.0.1:5432/space_new"

# Creamos el motor de conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creamos la fábrica de sesiones (cada petición tendrá su propia sesión)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para nuestros modelos
Base = declarative_base()

# Dependencia para obtener la DB en los endpoints (la usaremos luego)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()