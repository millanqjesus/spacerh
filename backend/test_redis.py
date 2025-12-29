import sys
import os

# Ajuste de rutas
sys.path.append(os.getcwd())

from app.core.redis_client import get_redis_client

def test_redis():
    print("🔴 Conectando a Redis...")
    
    try:
        r = get_redis_client()
        
        # 1. Prueba de escritura
        r.set("prueba_backend", "¡Redis funciona!")
        print("✅ Escritura exitosa.")
        
        # 2. Prueba de lectura
        valor = r.get("prueba_backend")
        print(f"✅ Lectura exitosa: {valor}")
        
        # 3. Prueba de expiración (Simulando el bloqueo temporal)
        r.setex("prueba_bloqueo", 5, "bloqueado") # Expira en 5 segundos
        print("✅ Llave con expiración creada (TTL 5s).")
        
    except Exception as e:
        print(f"❌ ERROR: No se pudo conectar a Redis. {e}")
        print("   -> ¿Ejecutaste el comando 'docker run'?")

if __name__ == "__main__":
    test_redis()