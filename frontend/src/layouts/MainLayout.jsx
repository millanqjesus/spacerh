import { Outlet, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth();

  // 1. Si está cargando, mostramos un spinner simple
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // 2. Si NO está autenticado, lo mandamos al Login (Protección de Rutas)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Si todo ok, mostramos el diseño completo
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Fijo */}
      <Header />

      {/* Contenido Variable (Aquí se renderizan las páginas hijas) */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer Fijo al final */}
      <Footer />
    </div>
  );
}