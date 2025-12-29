import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// --- RESTAURADO: Interceptor de Solicitud (Request) ---
// Para mantener la sesión al recargar (F5), necesitamos que Axios
// sea capaz de leer el token del almacenamiento local automáticamente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Interceptor de Respuesta (Maneja errores 401) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend dice "401 Unauthorized" (Credenciales inválidas)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o inválida. Cerrando sesión...");

      // Limpieza de basura
      localStorage.removeItem('token');

      // Redirigimos al login
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;