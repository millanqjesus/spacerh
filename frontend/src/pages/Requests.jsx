import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Calendar, Clock, MoreVertical, Building } from 'lucide-react';
import api from '../services/api';
import RequestModal from '../components/RequestModal';
import { showDialog } from '../utils/alert';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState({}); // Mapa de ID -> Nombre
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos al inicio
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Cargamos solicitudes y empresas en paralelo
      const [reqResponse, compResponse] = await Promise.all([
        api.get('/daily-requests'),
        api.get('/companies')
      ]);

      setRequests(reqResponse.data);

      // 2. Crear mapa de empresas para acceso rápido por ID
      const compMap = {};
      compResponse.data.forEach(c => {
        compMap[c.id] = c.name;
      });
      setCompanies(compMap);

    } catch (error) {
      console.error("Error cargando datos:", error);
      showDialog({ title: 'Erro', text: 'Não foi possível carregar as solicitações.', icon: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado local
  const filteredRequests = requests.filter(req => {
    const companyName = companies[req.company_id] || '';
    return companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Solicitações de Diárias</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie as demandas de trabalho e escalas</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-space-orange text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-medium text-sm"
        >
          <Plus size={18} />
          Nova Solicitação
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por empresa ou status..."
            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-space-orange focus:border-space-orange outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {isLoading ? (
        <div className="p-20 flex justify-center">
          <Loader2 className="animate-spin text-space-orange h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">

                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-space-orange">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">{companies[req.company_id] || 'Empresa Desconhecida'}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={18} /></button>
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
                  <button className="text-space-orange hover:text-orange-700 font-medium">Ver Detalhes &rarr;</button>
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

      {/* Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}