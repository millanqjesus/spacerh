import { useState, useEffect } from 'react';
import { Plus, Pencil, Search, Loader2, Building, Filter, Phone, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import CompanyModal from '../components/CompanyModal';
import { showDialog } from '../utils/alert';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const results = companies.filter(company =>
      company.name.toLowerCase().includes(lowerTerm) ||
      company.tax_id.includes(lowerTerm) ||
      (company.contact_person && company.contact_person.toLowerCase().includes(lowerTerm))
    );
    setFilteredCompanies(results);
  }, [searchTerm, companies]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/companies');
      setCompanies(response.data);
      setFilteredCompanies(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      showDialog({ title: 'Erro', text: 'Não foi possível carregar a lista de empresas.', icon: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (company) => {
    try {
      await api.put(`/companies/${company.id}`, { is_active: !company.is_active });
      const updatedList = companies.map(c =>
        c.id === company.id ? { ...c, is_active: !c.is_active } : c
      );
      setCompanies(updatedList);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showDialog({ title: 'Erro', text: 'Não foi possível alterar o status.', icon: 'error' });
    }
  };

  const openModal = (company = null) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Empresas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os clientes e parceiros ({companies.length} total)</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 bg-space-orange text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-medium text-sm">
          <Plus size={18} /> Nova Empresa
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-space-orange focus:border-space-orange sm:text-sm transition duration-150 ease-in-out" placeholder="Buscar por nome, CNPJ ou contato..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"><Filter size={16} /> Filtros</button>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin text-space-orange h-10 w-10 mb-4" />
            <p>Carregando dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100"><Building size={20} /></div>
                          <div>
                            <div className="font-medium text-gray-900">{company.name}</div>
                            <div className="text-gray-500 text-xs font-mono">{company.tax_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          {company.contact_person && (<div className="flex items-center gap-1.5 text-gray-900 font-medium"><User size={14} className="text-gray-400" />{company.contact_person}</div>)}
                          {(company.email || company.phone) ? (
                            <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                              {company.email && <span className="flex items-center gap-1"><Mail size={12} /> {company.email}</span>}
                              {company.phone && <span className="flex items-center gap-1"><Phone size={12} /> {company.phone}</span>}
                            </div>
                          ) : (<span className="text-xs text-gray-400 italic">Sem contato</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${company.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {company.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleStatus(company)} className={`p-2 rounded-lg transition-colors ${company.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={company.is_active ? "Desativar" : "Ativar"}>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${company.is_active ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`bg-white w-3 h-3 rounded-full shadow-sm transform duration-300 ${company.is_active ? 'translate-x-4' : 'translate-x-0'}`}></div></div>
                          </button>
                          <button onClick={() => openModal(company)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Pencil size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500"><p className="text-lg font-medium">Nenhuma empresa encontrada</p></td></tr>
                )}
              </tbody>
            </table>

            {/* Paginación Visual */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredCompanies.length}</span> de <span className="font-medium">{companies.length}</span> resultados
              </span>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                  <ChevronLeft size={20} className="text-gray-500" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" disabled>
                  <ChevronRight size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CompanyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} company={editingCompany} onSuccess={fetchCompanies} />
    </div>
  );
}