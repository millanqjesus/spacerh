import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function ChangePasswordModal({ isOpen, onClose, user }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  // Control de animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para permitir que el componente se monte antes de aplicar opacidad
      const timer = setTimeout(() => setIsVisible(true), 10);
      reset(); // Limpiamos el formulario cada vez que se abre
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    setIsVisible(false);
    // Esperamos a que termine la animación CSS (300ms) antes de desmontar real en el padre
    setTimeout(onClose, 300);
  };

  const onSubmit = async (data) => {
    try {
      await api.put(`/users/${user.id}`, { password: data.password });
      alert("Senha alterada com sucesso!");
      handleClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar a senha. Tente novamente.");
    }
  };

  // Si no debe mostrarse ni está animando salida, no renderizamos nada
  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
    >
      {/* Backdrop oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Panel del Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
      >
        {/* Header */}
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2">
            <Key size={20} />
            Alterar Senha
          </h3>
          <button onClick={handleClose} className="text-amber-800 hover:text-amber-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Info Usuario */}
        {user && (
          <div className="px-6 py-3 bg-amber-50/50 text-sm text-amber-800 border-b border-amber-100">
            Alterando senha para: <strong>{user.first_name} {user.last_name}</strong>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password', { required: true, minLength: 6 })}
                className="w-full p-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="******"
                autoFocus
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

          <div className="pt-2 flex gap-3 justify-end border-t border-gray-100 mt-4">
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
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
              {isSubmitting ? 'Salvando...' : 'Definir Nova Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}