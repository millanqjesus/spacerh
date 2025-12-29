import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Importamos el Proveedor
import Login from './pages/Login';

function App() {
  return (
    // Envolvemos la aplicación para que el contexto exista en todas partes
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: Login */}
          <Route path="/" element={<Login />} />

          {/* Ruta de prueba para el Dashboard (luego haremos una página real) */}
          <Route path="/dashboard" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-space-orange">Dashboard</h1>
                <p className="mt-4 text-gray-600">
                  Se você vê isso, o contexto está funcionando!
                </p>
              </div>
            </div>
          } />

          {/* Cualquier ruta desconocida redirige al login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;