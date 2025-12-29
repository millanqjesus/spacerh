import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Muestra el Login */}
        <Route path="/" element={<Login />} />

        {/* Aquí agregaremos la ruta /dashboard más adelante */}
        <Route path="/dashboard" element={<div>Dashboard Próximamente...</div>} />

        {/* Cualquier ruta desconocida redirige al login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;