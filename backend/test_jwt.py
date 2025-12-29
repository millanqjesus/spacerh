# test_jwt.py
import sys
import os
from datetime import timedelta

# Ajuste de rutas
sys.path.append(os.getcwd())

from app.core.security import create_access_token
from app.core.config import settings
import jwt

def test_probar_token():
    print("🔑 Probando generación de JWT...")
    
    # 1. Datos falsos de usuario
    datos_usuario = {"sub": "usuario@test.com"}
    
    # 2. Crear Token
    token = create_access_token(data=datos_usuario)
    print(f"✅ Token Generado:\n{token}")
    
    # 3. Verificar (Decodificar)
    print("\n🕵️  Intentando decodificar...")
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"✅ Contenido decodificado: {decoded}")
        
        if decoded["sub"] == "usuario@test.com":
            print("🎉 ¡ÉXITO! El token contiene la información correcta.")
            
    except Exception as e:
        print(f"❌ Error al decodificar: {e}")

if __name__ == "__main__":
    test_probar_token()