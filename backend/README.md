🛠️ Paso 1: Configuración del Entorno
Primero, necesitamos un lugar limpio donde trabajar y las herramientas necesarias.

Instrucciones:

Crea una carpeta para tu proyecto.

Abre tu terminal en esa carpeta.

Ejecuta los siguientes comandos (uno por uno):
# 1. Crear entorno virtual (aislar librerías)
python -m venv venv

# 2. Activar entorno
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# 3. Instalar el Stack (FastAPI, Servidor, Validaciones, Seguridad)
pip install fastapi uvicorn[standard] pydantic[email] passlib[bcrypt] python-multipart