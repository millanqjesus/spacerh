import { LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

// 1. Configuración del Menú (RBAC)
// Aquí defines quién puede ver qué.
const MENU_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    allowedRoles: ['admin', 'lider', 'contratado'] // Todos
  },
  {
    label: 'Usuários',
    path: '/users',
    allowedRoles: ['admin'] // Solo Admin
  },
  {
    label: 'Configurações',
    path: '/settings',
    allowedRoles: ['admin', 'lider'] // Admin y Líder
  }
];

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation(); // Para saber en qué ruta estamos

  // 2. Filtramos las opciones antes de renderizar
  // Si no hay usuario, mostramos lista vacía por seguridad
  const visibleMenuItems = MENU_ITEMS.filter(item =>
    user?.role && item.allowedRoles.includes(user.role)
  );

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

          {/* Navegación Desktop Dinámica */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            {visibleMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors duration-200 ${isActive
                      ? 'text-space-orange font-bold' // Estilo activo
                      : 'hover:text-space-orange'     // Estilo normal
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Usuario Derecha */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-gray-800">
              {user?.first_name} {user?.last_name}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-500 capitalize">{user?.role || 'Usuário'}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>

          {/* Botón Menú Móvil */}
          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}