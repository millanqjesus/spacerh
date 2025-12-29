import pytest
from app.core.security import get_password_hash, verify_password

def test_hashing_password_larga():
    """
    Verifica que Argon2 pueda manejar contraseñas de más de 72 bytes.
    (Bcrypt fallaría aquí).
    """
    # 1. Preparar datos
    password_largo = "A" * 100  # 100 caracteres
    
    # 2. Ejecutar acción (Hashing)
    # Si esto falla (lanza excepción), pytest marcará el test como fallido automáticamente.
    hash_seguro = get_password_hash(password_largo)
    
    # 3. Validar resultados
    # Verificamos que se haya generado algo (no sea vacío)
    assert hash_seguro is not None
    assert len(hash_seguro) > 0
    
    # Verificamos que el hash funcione al validar
    es_valido = verify_password(password_largo, hash_seguro)
    assert es_valido is True, "La verificación del hash falló para la contraseña larga"

def test_hashing_consistencia():
    """
    Verifica que el mismo password genere hashes distintos (Salting)
    pero que ambos sean válidos.
    """
    password = "SecretPassword123"
    
    hash1 = get_password_hash(password)
    hash2 = get_password_hash(password)
    
    # Argon2 debe generar sales aleatorias, por lo que los hashes deben ser distintos
    assert hash1 != hash2, "Los hashes deberían ser diferentes para la misma contraseña (falta Salting)"
    
    # Pero ambos deben funcionar para validar la contraseña original
    assert verify_password(password, hash1) is True
    assert verify_password(password, hash2) is True