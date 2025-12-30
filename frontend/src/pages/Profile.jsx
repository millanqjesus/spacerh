import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, FileText, Save, Key, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { showDialog } from '../utils/alert';

export default function Profile() {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Usamos 'reset' en lugar de 'setValue' para que isDirty funcione correctamente
  // al establecer los valores iniciales como "default"
  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm();

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        cpf: user.cpf
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    // 1. Preguntamos antes de guardar
    const confirmation = await showDialog({
      title: 'Salvar alterações?',
      text: 'Tem certeza que deseja atualizar seus dados pessoais?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, salvar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) return;

    try {
      // 2. Enviamos los datos
      await api.put(`/users/${user.id}`, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      });

      await showDialog({
        title: 'Perfil Atualizado!',
        text: 'Seus dados foram salvos com sucesso.',
        icon: 'success',
        confirmButtonText: 'Ótimo'
      });

      // Recargar para refrescar contexto
      window.location.reload();

    } catch (error) {
      console.error(error);
      showDialog({
        title: 'Erro',
        text: 'Não foi possível salvar as alterações.',
        icon: 'error'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
          <p className="text-gray-500 text-sm">Gerencie suas informações pessoais e segurança</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Columna Izquierda: Tarjeta de Resumen */}
        <div className="lg:col-span-1">
          {/* h-full para igualar altura, flex-col para centrar contenido */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center h-full flex flex-col justify-center items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-space-orange to-orange-400 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <ShieldCheck size={14} />
              {user?.role?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="lg:col-span-2">
          {/* h-full para asegurar la altura en el grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Informações Pessoais</h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-sm text-space-orange hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Key size={16} />
                Alterar Senha
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> Nome
                  </label>
                  <input
                    {...register('first_name', { required: true })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sobrenome</label>
                  <input
                    {...register('last_name', { required: true })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> E-mail
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" /> CPF
                  </label>
                  <input
                    {...register('cpf')}
                    disabled
                    className="w-full p-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                    title="Entre em contato com o administrador para alterar o CPF"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end mt-auto">
                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting} // Bloqueado si no hay cambios o está enviando
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm
                    ${(!isDirty || isSubmitting)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-space-orange text-white hover:bg-orange-600 hover:shadow-md'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        user={user}
      />
    </div>
  );
}