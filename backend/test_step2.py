import pytest
from pydantic import ValidationError
from app.schemas.schemas import UserCreate

# 1. Test para contraseña DÉBIL (Esperamos que falle)
def test_password_debil_falla():
    """
    Intenta crear un usuario con password débil.
    La prueba PASA si el sistema LANZA un error de validación.
    """
    password_debil = "Pa#3s" # Muy corta, falta longitud
    
    # "with pytest.raises" le dice al test: "Espero que la siguiente línea explote con un error"
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(email="test@example.com", password=password_debil)
    
    # Opcional: Verificar que el mensaje de error sea el correcto (parte del error de Pydantic)
    # assert "min_length" in str(excinfo.value) or "Value error" in str(excinfo.value)

# 2. Test para contraseña FUERTE (Esperamos que funcione)
def test_password_fuerte_funciona():
    """
    Intenta crear un usuario con password fuerte.
    La prueba PASA si NO ocurre ningún error.
    """
    password_fuerte = "HolaMundo$2024"
    
    try:
        usuario = UserCreate(email="test@example.com", password=password_fuerte, first_name="Juan", last_name="Pérez", cpf="123.456.789-00")
        # Verificamos que se guardó correctamente en el objeto
        assert usuario.password == password_fuerte
        assert usuario.email == "test@example.com"
    except ValidationError:
        pytest.fail("La contraseña fuerte fue rechazada incorrectamente.")

# 3. (Extra) Test para casos específicos de tu Regex
# Aquí probamos que tu validación detecte qué falta exactamente
@pytest.mark.parametrize("password_invalida", [
    "holamundo123!",  # Falta Mayúscula
    "HOLAMUNDO123!",  # Falta Minúscula
    "HolaMundo!!!!",  # Falta Número
    "HolaMundo1234",  # Falta Símbolo
    "Ab1!x",          # Muy corta (Tiene 5, el mínimo ahora es 6)
])
def test_varias_passwords_invalidas(password_invalida):
    with pytest.raises(ValidationError):
        UserCreate(email="fail@test.com", password=password_invalida)