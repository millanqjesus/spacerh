import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 1. Nuevo estado para el token (vive solo en memoria RAM)
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Como ya no usamos localStorage, al cargar la página siempre empezamos "limpios".
    // Si tuviéramos un sistema de Refresh Token con Cookies, aquí intentaríamos renovarlo.
    setLoading(false);
  }, []);

  const login = async (accessToken) => {
    // 1. Guardamos el token en el estado de React
    setToken(accessToken);
    setIsAuthenticated(true);

    // 2. IMPORTANTE: Configuramos Axios para que use este token en el futuro
    // Esto reemplaza al interceptor que leía de localStorage
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    try {
      // Cargamos los datos del usuario inmediatamente
      const response = await api.get('/users/me');
      setUser(response.data);
      return true;
    } catch (error) {
      console.error("Error al obtener datos de usuario", error);
      // Si falla, revertimos
      logout();
      return false;
    }
  };

  const logout = () => {
    // Limpiamos la memoria
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Quitamos el token de las cabeceras de Axios
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      token, // Ahora exponemos el token directamente desde el contexto
      isAuthenticated,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};