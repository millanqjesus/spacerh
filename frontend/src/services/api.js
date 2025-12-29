// src/services/api.js
import axios from 'axios';

// Creamos una instancia de Axios
// Asegúrate de que tu backend esté corriendo en el puerto 8000
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de cada petición, inyectamos el Token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;