import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Building, FileText, Phone, Mail, User } from 'lucide-react';
import api from '../services/api';
import { showDialog } from '../utils/alert';

export default function CompanyModal({ isOpen, onClose, company, onSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);

      if (company) {
        setValue('name', company.name);
        setValue('tax_id', company.tax_id);
        setValue('phone', company.phone);
        setValue('email', company.email);
        setValue('contact_person', company.contact_person);
      } else {
        reset({
          name: '',
          tax_id: '',
          phone: '',
          email: '',
          contact_person: ''
        });
      }
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, company, reset, setValue]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const onSubmit = async (data) => {
    const confirmation = await showDialog({
      title: company ? 'Atualizar empresa?' : 'Cadastrar empresa?',
      text: company
        ? 'Os dados da empresa serão atualizados.'
        : 'Uma nova empresa será adicionada ao sistema.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: company ? 'Sim, atualizar' : 'Sim, cadastrar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) return;

    try {
      if (company) {
        await api.put(`/companies/${company.id}`, data);
        await showDialog({ title: 'Sucesso!', text: 'Empresa atualizada com sucesso.', icon: 'success' });
      } else {
        await api.post('/companies', data);
        await showDialog({ title: 'Sucesso!', text: 'Empresa cadastrada com sucesso.', icon: 'success' });
      }

      handleClose();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Ocorreu um erro ao salvar.';
      showDialog({ title: 'Erro', text: errorMsg, icon: 'error' });
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>
      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Building className="text-space-orange" size={20} />
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Nome</label>
            <div className="relative">
              <input
                {...register('name', { required: true })}
                className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange focus:ring-1 focus:ring-space-orange transition-all"
                placeholder="Ex: Tech Solutions Ltda"
              />
              <Building className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>

          {/* ID Fiscal (CNPJ) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ / Identificador Fiscal</label>
            <div className="relative">
              <input
                {...register('tax_id', { required: true })}
                className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange focus:ring-1 focus:ring-space-orange transition-all"
                placeholder="00.000.000/0001-00"
              />
              <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <div className="relative">
                <input
                  {...register('phone')}
                  className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange focus:ring-1 focus:ring-space-orange transition-all"
                  placeholder="(00) 0000-0000"
                />
                <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange focus:ring-1 focus:ring-space-orange transition-all"
                  placeholder="contato@empresa.com"
                />
                <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {/* Persona de Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa de Contato</label>
            <div className="relative">
              <input
                {...register('contact_person')}
                className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange focus:ring-1 focus:ring-space-orange transition-all"
                placeholder="Nome do responsável"
              />
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-space-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium shadow-sm">
              {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
              {isSubmitting ? 'Salvando...' : (company ? 'Atualizar Empresa' : 'Cadastrar Empresa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}