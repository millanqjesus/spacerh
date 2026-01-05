import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Building, Clock, DollarSign, Users, Trash2, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { showDialog } from '../utils/alert';
import EmployeeSelectionModal from '../components/EmployeeSelectionModal';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para el modal de asignación
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const { data: reqData } = await api.get(`/daily-requests/${id}`);
      setRequest(reqData);

      if (reqData.company_id) {
        const { data: compData } = await api.get(`/companies/${reqData.company_id}`);
        setCompany(compData);
      }
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      showDialog({ title: 'Erro', text: 'Não foi possível carregar os detalhes.', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAssignmentModal = (shiftId) => {
    setSelectedShiftId(shiftId);
    setIsSelectionModalOpen(true);
  };

  const handleRemoveAssignment = async (assignmentId) => {
    const confirmation = await showDialog({
      title: 'Remover colaborador?',
      text: 'Ele será removido deste turno.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar'
    });

    if (confirmation.isConfirmed) {
      try {
        await api.delete(`/daily-requests/assignments/${assignmentId}`);
        fetchRequestDetails(); // Recargar para ver los cambios
        showDialog({ title: 'Removido', text: 'Colaborador removido do turno.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error) {
        showDialog({ title: 'Erro', text: 'Erro ao remover colaborador.', icon: 'error' });
      }
    }
  };

  const handleToggleAttendance = async (assignment) => {
    const newStatus = assignment.status === 'PRESENTE' ? 'ASIGNADO' : 'PRESENTE';

    try {
      await api.put(`/daily-requests/assignments/${assignment.id}/status`, { status: newStatus });
      // Actualizamos localmente
      const updatedShifts = request.shifts.map(shift => {
        if (shift.id === assignment.shift_id) {
          return {
            ...shift,
            assignments: shift.assignments.map(a =>
              a.id === assignment.id ? { ...a, status: newStatus } : a
            )
          };
        }
        return shift;
      });

      setRequest({ ...request, shifts: updatedShifts });

    } catch (error) {
      console.error(error);
      showDialog({ title: 'Erro', text: 'Erro ao atualizar presença.', icon: 'error' });
    }
  };

  if (loading && !request) {
    return <div className="p-20 text-center text-gray-500">Carregando detalhes...</div>;
  }

  if (!request) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/requests')}
        className="flex items-center text-gray-500 hover:text-space-orange transition-colors mb-2"
      >
        <ArrowLeft size={20} className="mr-1" /> Voltar para lista
      </button>

      {/* Cabecera */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center text-space-orange">
            <Building size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company?.name || '...'}</h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <Calendar size={16} />
              <span className="font-medium">
                {new Date(request.request_date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${request.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
            {request.status}
          </span>
        </div>
      </div>

      {/* Turnos */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock size={20} className="text-space-orange" />
          Turnos e Escalas
        </h2>

        {request.shifts && request.shifts.length > 0 ? (
          request.shifts.map((shift) => (
            <div key={shift.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row gap-6">

                {/* Columna Izquierda: Detalles del Turno */}
                <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Horário</span>
                    {shift.has_discount && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        -{shift.discount_percentage}% Desc.
                      </span>
                    )}
                  </div>

                  <div className="text-xl font-bold text-gray-800 mb-1">
                    {new Date(shift.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(shift.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="font-semibold">{shift.payment_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                      <Users size={14} className="text-blue-600" />
                      <span>{shift.assignments ? shift.assignments.length : 0} / {shift.quantity} Vagas</span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Asignaciones */}
                <div className="md:w-2/3 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Colaboradores Escalados</h4>
                    <button
                      onClick={() => openAssignmentModal(shift.id)}
                      className="text-sm text-space-orange hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="flex-grow">
                    {shift.assignments && shift.assignments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {shift.assignments.map((assign) => (
                          <div key={assign.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 group hover:border-orange-100 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                {assign.employee.first_name[0]}{assign.employee.last_name[0]}
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {assign.employee.first_name} {assign.employee.last_name}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{assign.status}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleAttendance(assign)}
                                className={`p-1.5 rounded-full transition-colors ${assign.status === 'PRESENTE'
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                title={assign.status === 'PRESENTE' ? "Marcar como ausente" : "Confirmar presença"}
                              >
                                <CheckCircle size={16} />
                              </button>

                              <button
                                onClick={() => handleRemoveAssignment(assign.id)}
                                className="text-gray-300 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg py-6 bg-gray-50/50">
                        <Users size={24} className="mb-2 opacity-50" />
                        <p className="text-sm">Nenhum colaborador escalado.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            Nenhum turno registrado para esta solicitação.
          </div>
        )}
      </div>

      <EmployeeSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        shiftId={selectedShiftId}
        assignedEmployeeIds={
          selectedShiftId && request.shifts
            ? request.shifts.find(s => s.id === selectedShiftId)?.assignments.map(a => a.employee_id) || []
            : []
        }
        onSuccess={() => fetchRequestDetails()}
      />
    </div>
  );
}