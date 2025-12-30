import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Loader2, Shield, ShieldAlert,
  User as UserIcon, Search, ChevronLeft, ChevronRight,
  Filter, Key
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import UserModal from '../components/UserModal';
import { showDialog } from '../utils/alert';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Modales
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const results = users.filter(user =>
      user.first_name.toLowerCase().includes(lowerTerm) ||
      user.last_name.toLowerCase().includes(lowerTerm) ||
      user.email.toLowerCase().includes(lowerTerm) ||
      user.cpf.includes(lowerTerm)
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      const updatedList = users.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      );
      setUsers(updatedList);
    } catch (error) {
      showDialog({ title: 'Erro', text: 'Não foi possível alterar o status.', icon: 'error' });
    }
  };

  // Se eliminó la función handleDelete por solicitud del usuario

  // UI Helpers
  const openUserModal = (user = null) => {
    setEditingUser(user);
    setIsPasswordModalOpen(false);
    setIsUserModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setPasswordUser(user);
    setIsUserModalOpen(false);
    setIsPasswordModalOpen(true);
  };

  const roleLabels = { admin: 'ADMIN', lider: 'LIDER', contratado: 'CONTRATADO' };
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    lider: 'bg-blue-100 text-blue-700 border-blue-200',
    contratado: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o acesso e permissões da equipe ({users.length} total)</p>
        </div>

        <button
          onClick={() => openUserModal()}
          className="flex items-center justify-center gap-2 bg-space-orange text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-medium text-sm"
        >
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-space-orange focus:border-space-orange outline-none transition duration-150"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin text-space-orange h-10 w-10 mb-4" />
            <p>Carregando dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Função</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">CPF</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-space-orange to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                          {user.role === 'admin' ? <ShieldAlert size={12} /> : <UserIcon size={12} />}
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm font-mono">{user.cpf}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                          {/* Toggle */}
                          {currentUser?.id !== user.id && (
                            <button
                              onClick={() => toggleStatus(user)}
                              title={user.is_active ? "Desativar" : "Ativar"}
                              className={`p-2 rounded-lg transition-colors ${user.is_active
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                                }`}
                            >
                              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform duration-300 ${user.is_active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                            </button>
                          )}

                          {/* Botón Password */}
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Alterar Senha"
                          >
                            <Key size={18} />
                          </button>

                          <button
                            onClick={() => openUserModal(user)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* Botón Eliminar REMOVIDO */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">Nenhum usuário encontrado</p>
                        <p className="text-sm">Tente buscar com outros termos.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación Visual */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredUsers.length}</span> de <span className="font-medium">{users.length}</span> resultados
              </span>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                  <ChevronLeft size={20} className="text-gray-500" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                  <ChevronRight size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} user={editingUser} onSuccess={fetchUsers} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} user={passwordUser} />
    </div>
  );
}