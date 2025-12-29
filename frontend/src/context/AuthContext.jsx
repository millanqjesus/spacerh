import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Al cargar la página, intentamos recuperar la sesión
  useEffect(() => {
    const recoverSession = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // El interceptor de api.js ya inyectará el token aquí
          const response = await api.get('/users/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("No se pudo restaurar la sesión:", error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    recoverSession();
  }, []);

  const login = async (accessToken) => {
    // 2. Guardamos en DISCO (localStorage) para que sobreviva al F5
    localStorage.setItem('token', accessToken);
    setIsAuthenticated(true);

    try {
      const response = await api.get('/users/me');
      setUser(response.data);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
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