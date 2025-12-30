from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, companies

app = FastAPI(title="Backend Profesional")

# --- CONFIGURACIÓN CORS (Vital para que React se conecte) ---
# Definimos quién tiene permiso para hablar con este backend
origins = [
    "http://localhost:5173",    # El puerto por defecto de Vite
    "http://127.0.0.1:5173",    # Alternativa local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Lista de orígenes permitidos
    allow_credentials=True,     # Permitir cookies/headers de autenticación
    allow_methods=["*"],        # Permitir todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],        # Permitir todos los headers (Authorization, Content-Type, etc.)
)

# Incluimos los routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(companies.router)

@app.get("/")
def read_root():
    return {"mensaje": "O backend está vivo e organizado!"}