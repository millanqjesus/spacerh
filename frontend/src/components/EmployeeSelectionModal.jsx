import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Loader2, User, Plus } from 'lucide-react';
import api from '../services/api';
import { showDialog } from '../utils/alert';

export default function EmployeeSelectionModal({ isOpen, onClose, shiftId, onSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null); // ID del usuario que se está asignando

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      fetchEmployees();
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filtrado local en tiempo real
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const results = employees.filter(emp =>
      emp.first_name.toLowerCase().includes(lowerTerm) ||
      emp.last_name.toLowerCase().includes(lowerTerm) ||
      emp.email.toLowerCase().includes(lowerTerm)
    );
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      // Filtramos solo los que son trabajadores ("contratado") y están activos
      const workers = response.data.filter(u => u.role === 'contratado' && u.is_active);
      setEmployees(workers);
      setFilteredEmployees(workers);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAssign = async (employeeId) => {
    setAssigningId(employeeId);
    try {
      await api.post('/daily-requests/assignments', {
        shift_id: shiftId,
        employee_id: employeeId
      });

      await showDialog({
        title: 'Sucesso!',
        text: 'Colaborador escalado com sucesso.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      if (onSuccess) onSuccess(); // Recargar datos en el padre

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || "Erro ao escalar colaborador.";
      showDialog({ title: 'Erro', text: msg, icon: 'error' });
    } finally {
      setAssigningId(null);
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>

      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <UserPlus className="text-space-orange" size={20} />
            Escalar Colaborador
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 p-2 border border-gray-300 rounded-lg outline-none focus:border-space-orange text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-space-orange" /></div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center p-4 text-gray-500 text-sm">Nenhum colaborador disponível encontrado.</div>
          ) : (
            <div className="space-y-1">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold shadow-sm">
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-gray-500">{emp.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssign(emp.id)}
                    disabled={assigningId === emp.id}
                    className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-space-orange hover:text-white hover:border-space-orange transition-all shadow-sm"
                    title="Adicionar ao turno"
                  >
                    {assigningId === emp.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button onClick={handleClose} className="text-sm text-gray-500 hover:text-gray-800 font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">Fechar</button>
        </div>

      </div>
    </div>
  );
}