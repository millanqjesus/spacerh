import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { showDialog } from '../utils/alert';

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      setShowPassword(false);

      if (user) {
        // Modo Edición: Cargar datos existentes
        setValue('first_name', user.first_name);
        setValue('last_name', user.last_name);
        setValue('email', user.email);
        setValue('cpf', user.cpf);
        setValue('role', user.role);
      } else {
        // Modo Creación: Establecer valores por defecto
        reset({
          role: 'contratado', // Valor por defecto seguro
          first_name: '',
          last_name: '',
          email: '',
          cpf: '',
          password: ''
        });
      }
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, user, reset, setValue]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const onSubmit = async (data) => {
    // 1. Confirmación con SweetAlert antes de enviar
    const confirmation = await showDialog({
      title: user ? 'Atualizar usuário?' : 'Criar usuário?',
      text: user
        ? 'Os dados do usuário serão atualizados.'
        : 'Um novo usuário será criado com acesso ao sistema.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: user ? 'Sim, atualizar' : 'Sim, criar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) return;

    try {
      if (user) {
        // --- EDITAR ---
        await api.put(`/users/${user.id}`, data);

        await showDialog({
          title: 'Sucesso!',
          text: 'Usuário atualizado corretamente.',
          icon: 'success'
        });
      } else {
        // --- CREAR ---
        // Aseguramos que se envíe el rol seleccionado o el default
        const formData = { ...data, password: data.password };
        await api.post('/auth/signup', formData);

        await showDialog({
          title: 'Sucesso!',
          text: 'Usuário criado corretamente.',
          icon: 'success'
        });
      }

      handleClose();
      if (onSuccess) onSuccess(); // Recargar la lista en el padre

    } catch (error) {
      console.error(error);
      showDialog({
        title: 'Erro',
        text: error.response?.data?.detail || 'Ocorreu um erro ao salvar os dados.',
        icon: 'error'
      });
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input {...register('first_name', { required: true })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all" placeholder="João" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
              <input {...register('last_name', { required: true })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all" placeholder="Silva" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input {...register('cpf', { required: true })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all" placeholder="000.000.000-00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" {...register('email', { required: true })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all" placeholder="email@exemplo.com" />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: !user, minLength: 6 })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all"
                  placeholder="******"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função (Role)</label>
            <select {...register('role')} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all">
              <option value="contratado">CONTRATADO</option>
              <option value="lider">LIDER</option>
              <option value="admin">ADMIN</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-space-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
              {isSubmitting ? 'Salvando...' : (user ? 'Atualizar' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}