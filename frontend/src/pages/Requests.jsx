import { useState, useEffect } from 'react';
import {
  Plus, Search, Loader2, Calendar, Clock, MoreVertical,
  Building, Trash2, XCircle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import RequestModal from '../components/RequestModal';
import { showDialog } from '../utils/alert';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default dates: First day of current month to Last day of current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [filters, setFilters] = useState({
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
    companyId: ''
  });

  // Estado para el menú desplegable (3 puntitos)
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        ...(filters.companyId && { company_id: filters.companyId })
      };

      const [reqResponse, compResponse] = await Promise.all([
        api.get('/daily-requests', { params }),
        api.get('/companies')
      ]);

      setRequests(reqResponse.data);
      setCompanies(compResponse.data);

    } catch (error) {
      console.error("Error cargando datos:", error);
      showDialog({ title: 'Erro', text: 'Não foi possível carregar as solicitações.', icon: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Acción: Cambiar Estado (Confirmar / Cancelar)
  const handleStatusChange = async (request, newStatus) => {
    setOpenMenuId(null);
    try {
      await api.put(`/daily-requests/${request.id}/status`, { status: newStatus });

      // Actualizamos la lista localmente para feedback inmediato
      const updatedRequests = requests.map(r =>
        r.id === request.id ? { ...r, status: newStatus } : r
      );
      setRequests(updatedRequests);

      showDialog({
        title: 'Status Atualizado',
        text: `A solicitação agora está ${newStatus}.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error(error);
      showDialog({ title: 'Erro', text: 'Erro ao atualizar status.', icon: 'error' });
    }
  };

  // Acción: Eliminar Solicitud
  const handleDelete = async (request) => {
    setOpenMenuId(null);
    const result = await showDialog({
      title: 'Excluir Solicitação?',
      text: 'Isso apagará a solicitação e todos os seus turnos permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/daily-requests/${request.id}`);
        setRequests(requests.filter(r => r.id !== request.id));
        showDialog({ title: 'Excluído', text: 'Solicitação removida.', icon: 'success' });
      } catch (error) {
        console.error(error);
        showDialog({ title: 'Erro', text: 'Erro ao excluir.', icon: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6" onClick={() => setOpenMenuId(null)}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Solicitações de Diárias</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as demandas de trabalho e escalas</p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-space-orange text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-medium text-sm"
        >
          <Plus size={18} />
          Nova Solicitação
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
            <select
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
            >
              <option value="">Todas as Empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-space-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={18} /> Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-20 flex justify-center">
          <Loader2 className="animate-spin text-space-orange h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col relative">

                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-space-orange">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">
                        {companies.find(c => c.id === req.company_id)?.name || 'Empresa Desconhecida'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* MENÚ DE 3 PUNTOS */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === req.id ? null : req.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Menú Flotante */}
                    {openMenuId === req.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {req.status !== 'CONFIRMADA' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(req, 'CONFIRMADA'); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                          >
                            <CheckCircle size={16} /> Confirmar
                          </button>
                        )}

                        {req.status !== 'CANCELADA' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(req, 'CANCELADA'); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                          >
                            <XCircle size={16} /> Cancelar
                          </button>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(req); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detalles */}
                <div className="space-y-3 text-sm text-gray-600 mb-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {new Date(req.request_date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>
                      {req.shifts ? req.shifts.length : 0} Turno(s) registrado(s)
                    </span>
                  </div>
                </div>

                {/* Footer Tarjeta */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="text-gray-400 text-xs">ID: #{req.id}</span>
                  <button
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="text-space-orange hover:text-orange-700 font-medium"
                  >
                    Ver Detalhes &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p>Nenhuma solicitação encontrada.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para Crear Solicitudes */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}