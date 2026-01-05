import { LogOut, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { showDialog } from '../utils/alert'; // Importamos nuestra utilidad de alertas

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    allowedRoles: ['admin', 'lider', 'contratado']
  },
  {
    label: 'Usuários',
    path: '/users',
    allowedRoles: ['admin']
  },
  {
    label: 'Empresas',
    path: '/companies',
    allowedRoles: ['admin']
  },
  {
    label: 'Solicitações',
    path: '/requests',
    allowedRoles: ['admin', 'lider']
  },
  {
    label: 'Configurações',
    path: '/settings',
    allowedRoles: ['admin', 'lider']
  },
  {
    label: 'Meu Perfil',
    path: '/profile',
    allowedRoles: ['admin', 'lider', 'contratado']
  }
];

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Función para manejar el cierre de sesión con confirmación
  const handleLogout = async () => {
    const result = await showDialog({
      title: 'Sair do Sistema?',
      text: 'Tem certeza que deseja encerrar sua sessão atual?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const visibleMenuItems = MENU_ITEMS.filter(item =>
    user?.role && item.allowedRoles.includes(user.role)
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="https://www.spacerh.com.br/ws/media-library/28076a3924164c9b9313f5d88d389e6b/wwwwwww.png"
              alt="Space Logo"
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            {visibleMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors duration-200 ${isActive
                    ? 'text-space-orange font-bold'
                    : 'hover:text-space-orange'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Nombre del usuario ahora es un link al perfil */}
          <Link to="/profile" className="hidden md:flex flex-col items-end mr-2 hover:opacity-70 transition-opacity cursor-pointer">
            <span className="text-sm font-semibold text-gray-800">
              {user?.first_name} {user?.last_name}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-500 capitalize">{user?.role || 'Usuário'}</span>
            </div>
          </Link>

          <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

          {/* Botón de Logout conectado a la nueva función */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>

          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}