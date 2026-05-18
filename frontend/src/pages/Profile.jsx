import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, FileText, Save, Key, Loader2, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { showDialog } from '../utils/alert';
import { parseApiError } from '../utils/parseApiError';

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
        text: parseApiError(error, 'Não foi possível salvar as alterações.'),
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col relative group">
            {/* Decorative background header */}
            <div className="h-28 bg-gradient-to-r from-space-orange to-orange-600 w-full absolute top-0 left-0"></div>
            
            <div className="relative pt-12 p-6 flex flex-col items-center flex-grow">
              <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg mb-5 relative group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-space-orange to-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                {/* Optional camera icon badge */}
                {/* <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-gray-600 cursor-pointer hover:text-space-orange transition-colors">
                  <Camera size={16} />
                </div> */}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.first_name} {user?.last_name}</h2>
              <p className="text-gray-500 text-sm mb-6 flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                {user?.email}
              </p>

              <div className="mt-auto pt-6 border-t border-gray-50 w-full flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100 shadow-sm">
                  <ShieldCheck size={16} />
                  {user?.role?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 h-full flex flex-col relative overflow-hidden">
             {/* Subtle corner decoration */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-5 border-b border-gray-100 relative z-10 gap-4">
              <div>
                 <h3 className="text-xl font-bold text-gray-800">Informações Pessoais</h3>
                 <p className="text-sm text-gray-500 mt-1">Mantenha seus dados atualizados</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-sm px-4 py-2.5 bg-orange-50 text-space-orange hover:bg-space-orange hover:text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-300 w-full sm:w-auto justify-center border border-orange-100 hover:border-space-orange"
              >
                <Key size={16} />
                <span>Alterar Senha</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-grow relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">Nome</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400 group-focus-within:text-space-orange transition-colors" />
                    </div>
                    <input
                      {...register('first_name', { required: true })}
                      className="w-full pl-10 p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all shadow-sm text-gray-800"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">Sobrenome</label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400 group-focus-within:text-space-orange transition-colors" />
                    </div>
                    <input
                      {...register('last_name', { required: true })}
                      className="w-full pl-10 p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all shadow-sm text-gray-800"
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">E-mail</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400 group-focus-within:text-space-orange transition-colors" />
                    </div>
                    <input
                      type="email"
                      {...register('email', { required: true })}
                      className="w-full pl-10 p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-space-orange/20 focus:border-space-orange outline-none transition-all shadow-sm text-gray-800"
                      placeholder="exemplo@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">CPF</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <input
                      {...register('cpf')}
                      disabled
                      className="w-full pl-10 p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed opacity-80"
                      title="Entre em contato com o administrador para alterar o CPF"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end mt-auto">
                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300
                    ${(!isDirty || isSubmitting)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-space-orange text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={20} /> Salvar Alterações
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