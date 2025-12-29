import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout'; // Importamos el Layout

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA PÚBLICA (Sin Header/Footer) */}
          <Route path="/" element={<Login />} />

          {/* RUTAS PROTEGIDAS (Con Layout) */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="mt-2 text-gray-600">Bem-vindo ao sistema SPACE.</p>
              </div>
            } />

            {/* Aquí puedes agregar más páginas protegidas en el futuro */}
            <Route path="/users" element={<div>Gestão de Usuários (Em breve)</div>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;