import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo y Menú Izquierda */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="https://www.spacerh.com.br/ws/media-library/28076a3924164c9b9313f5d88d389e6b/wwwwwww.png"
              alt="Space Logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link to="/dashboard" className="hover:text-space-orange transition-colors">Dashboard</Link>
            <Link to="/users" className="hover:text-space-orange transition-colors">Usuários</Link>
            <Link to="/settings" className="hover:text-space-orange transition-colors">Configurações</Link>
          </nav>
        </div>

        {/* Usuario Derecha */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-gray-800">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="text-xs text-gray-500 capitalize">{user?.role || 'Usuário'}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>

          {/* Botón Menú Móvil (Solo visible en pantallas chicas) */}
          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}