import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, Pencil, Trash2, X, Loader2, Shield, ShieldAlert,
  User as UserIcon, Eye, EyeOff, Search, ChevronLeft, ChevronRight,
  Filter, Key
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal'; // <--- Importamos el componente

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Controla si se muestra el componente

  const [isVisible, setIsVisible] = useState(false); // Para el modal principal (Create/Edit)
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null); // Usuario seleccionado para cambio de clave

  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Efecto de animación solo para el modal principal (el de password ya tiene el suyo)
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

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
      console.error("Erro ao alterar status:", error);
      alert("Não foi possível alterar o status do usuário.");
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data);
        alert("Usuário atualizado com sucesso!");
      } else {
        const formData = { ...data, password: data.password };
        await api.post('/auth/signup', formData);
        alert("Usuário criado com sucesso!");
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar usuário. Verifique os dados.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert("Erro ao excluir usuário.");
      }
    }
  };

  // --- UI HELPERS ---

  const openModal = (user = null) => {
    setEditingUser(user);
    // Aseguramos que el otro modal esté cerrado
    setIsPasswordModalOpen(false);
    setPasswordUser(null);
    setShowPassword(false);

    if (user) {
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('email', user.email);
      setValue('cpf', user.cpf);
      setValue('role', user.role);
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setPasswordUser(user);
    setIsPasswordModalOpen(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setEditingUser(null);
    }, 300);
  };

  const roleLabels = { admin: 'ADMIN', lider: 'LIDER', contratado: 'CONTRATADO' };
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    lider: 'bg-blue-100 text-blue-700 border-blue-200',
    contratado: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o acesso e permissões da equipe ({users.length} total)</p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-space-orange text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-medium text-sm"
        >
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-t-xl border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-space-orange focus:border-space-orange sm:text-sm transition duration-150 ease-in-out"
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

      {/* Tabla */}
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
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
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

                          {/* Botón Password - Abre el nuevo modal */}
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Alterar Senha"
                          >
                            <Key size={18} />
                          </button>

                          <button
                            onClick={() => openModal(user)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
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

            {/* Footer Tabla */}
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

      {/* --- Modal Principal (Datos) --- */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'visible' : 'invisible'}`}
        >
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeModal}
          ></div>

          <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Formulario de Datos Personales (Igual que antes) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input {...register('first_name', { required: !isPasswordModalOpen })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none" placeholder="João" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                  <input {...register('last_name', { required: !isPasswordModalOpen })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none" placeholder="Silva" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input {...register('cpf', { required: !isPasswordModalOpen })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" {...register('email', { required: !isPasswordModalOpen })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none" placeholder="email@exemplo.com" />
              </div>

              {/* Campo de contraseña SOLO si es NUEVO usuario */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register('password', { required: !editingUser, minLength: 6 })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none"
                      placeholder="******"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função (Role)</label>
                <select {...register('role')} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none">
                  <option value="contratado">CONTRATADO</option>
                  <option value="lider">LIDER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-space-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-sm">{isSubmitting ? 'Salvando...' : (editingUser ? 'Salvar Alterações' : 'Criar Usuário')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal de Password Reutilizable --- */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => { setIsPasswordModalOpen(false); setPasswordUser(null); }}
        user={passwordUser}
      />
    </div>
  );
}