import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { X, Loader2, Calendar, Clock, DollarSign, Users as UsersIcon, Plus, Trash2, Building, Percent } from 'lucide-react';
import api from '../services/api';
import { showDialog } from '../utils/alert';

// Componente interno para fila de turno
const ShiftItem = ({ index, register, remove, control, errors }) => {
  // Observamos el valor del checkbox de ESTA fila específica
  const hasDiscount = useWatch({
    control,
    name: `shifts.${index}.has_discount`,
    defaultValue: false
  });

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group transition-all hover:border-orange-200 hover:shadow-sm mb-3">
      {/* Botón Eliminar */}
      <button
        type="button"
        onClick={() => remove(index)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        title="Remover turno"
      >
        <Trash2 size={16} />
      </button>

      <div className="flex flex-col gap-3 pr-6">

        {/* LÍNEA 1: FECHAS (Inicio | Fin) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Início</label>
            <div className="relative">
              <input
                type="datetime-local"
                {...register(`shifts.${index}.start_time`, { required: true })}
                className="w-full p-2 pl-8 border border-gray-300 rounded-md text-sm focus:border-space-orange outline-none bg-white"
              />
              <Clock className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Fim</label>
            <div className="relative">
              <input
                type="datetime-local"
                {...register(`shifts.${index}.end_time`, { required: true })}
                className="w-full p-2 pl-8 border border-gray-300 rounded-md text-sm focus:border-space-orange outline-none bg-white"
              />
              <Clock className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
            </div>
          </div>
        </div>

        {/* LÍNEA 2: PRECIO | CHECK | % DESC | CANTIDAD */}
        <div className="grid grid-cols-12 gap-3 items-end">

          {/* Valor Base */}
          <div className="col-span-3">
            <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Valor (R$)</label>
            <div className="relative">
              <input
                type="number" step="0.01" min="0" placeholder="0.00"
                {...register(`shifts.${index}.payment_amount`, { required: true })}
                className="w-full p-2 pl-7 border border-gray-300 rounded-md text-sm focus:border-space-orange outline-none bg-white"
              />
              <DollarSign className="absolute left-2 top-2.5 text-gray-400" size={12} />
            </div>
          </div>

          {/* Check Descuento */}
          <div className="col-span-3 flex items-center justify-center pb-2">
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                {...register(`shifts.${index}.has_discount`)}
                className="form-checkbox h-4 w-4 text-space-orange rounded border-gray-300 focus:ring-space-orange transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-xs text-gray-700 font-medium">Desconto?</span>
            </label>
          </div>

          {/* Input Porcentaje (Bloqueado si no hay check) */}
          <div className="col-span-3">
            <label className={`text-xs font-medium ml-1 block mb-1 ${hasDiscount ? 'text-gray-500' : 'text-gray-300'}`}>% Desc.</label>
            <div className="relative">
              <input
                type="number" step="0.1" min="0" max="100" placeholder="0"
                disabled={!hasDiscount}
                {...register(`shifts.${index}.discount_percentage`)}
                className={`w-full p-2 pl-7 border rounded-md text-sm outline-none transition-colors ${hasDiscount
                    ? 'border-gray-300 bg-white focus:border-space-orange'
                    : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              />
              <Percent className={`absolute left-2 top-2.5 ${hasDiscount ? 'text-gray-400' : 'text-gray-300'}`} size={12} />
            </div>
          </div>

          {/* Cantidad Personas */}
          <div className="col-span-3">
            <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Qtd.</label>
            <div className="relative">
              <input
                type="number" min="1"
                {...register(`shifts.${index}.quantity`, { required: true, min: 1 })}
                className="w-full p-2 pl-7 border border-gray-300 rounded-md text-sm focus:border-space-orange outline-none bg-white"
              />
              <UsersIcon className="absolute left-2 top-2.5 text-gray-400" size={12} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function RequestModal({ isOpen, onClose, onSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const [companies, setCompanies] = useState([]);

  const { register, control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      company_id: '',
      request_date: new Date().toISOString().split('T')[0],
      shifts: [
        { start_time: '', end_time: '', payment_amount: '', quantity: 1, has_discount: false, discount_percentage: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shifts"
  });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await api.get('/companies');
        setCompanies(response.data.filter(c => c.is_active));
      } catch (error) {
        console.error("Error al cargar empresas", error);
      }
    };
    if (isOpen) loadCompanies();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      reset();
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const onSubmit = async (data) => {
    if (data.shifts.length === 0) {
      alert("Adicione pelo menos um turno.");
      return;
    }

    const confirmation = await showDialog({
      title: 'Criar Solicitação?',
      text: `Você está criando uma diária com ${data.shifts.length} turno(s).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, criar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) return;

    try {
      const formattedData = {
        ...data,
        shifts: data.shifts.map(shift => ({
          ...shift,
          payment_amount: parseFloat(shift.payment_amount),
          quantity: parseInt(shift.quantity),
          has_discount: Boolean(shift.has_discount),
          discount_percentage: shift.has_discount ? parseFloat(shift.discount_percentage) : 0
        }))
      };

      await api.post('/daily-requests', formattedData);

      await showDialog({ title: 'Sucesso!', text: 'Solicitação criada com sucesso.', icon: 'success' });
      handleClose();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      showDialog({ title: 'Erro', text: 'Erro ao criar solicitação.', icon: 'error' });
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>

      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Calendar className="text-space-orange" size={20} />
            Nova Solicitação de Diária
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="request-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <div className="relative">
                  <select
                    {...register('company_id', { required: true })}
                    className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange bg-white appearance-none"
                  >
                    <option value="">Selecione uma empresa...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Building className="absolute left-3 top-3 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Diária</label>
                <div className="relative">
                  <input
                    type="date"
                    {...register('request_date', { required: true })}
                    className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none focus:border-space-orange"
                  />
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Clock size={18} /> Turnos de Trabalho
                </h4>
                <button
                  type="button"
                  onClick={() => append({ start_time: '', end_time: '', payment_amount: '', quantity: 1, has_discount: false, discount_percentage: 0 })}
                  className="text-sm flex items-center gap-1 text-space-orange hover:text-orange-700 font-medium"
                >
                  <Plus size={16} /> Adicionar Turno
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <ShiftItem
                    key={field.id}
                    index={index}
                    register={register}
                    remove={remove}
                    control={control}
                    errors={errors}
                  />
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancelar</button>
          <button
            type="submit"
            form="request-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-space-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" /> Processando...
              </>
            ) : (
              'Criar Solicitação'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}