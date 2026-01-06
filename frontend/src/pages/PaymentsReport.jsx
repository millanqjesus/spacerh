import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Building, Calendar, Search } from 'lucide-react';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { showDialog } from '../utils/alert';

export default function PaymentsReport() {
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    companyId: ''
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies/');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.startDate || !filters.endDate) {
      showDialog({ title: 'Atenção', text: 'Selecione as datas de início e fim.', icon: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        ...(filters.companyId && { company_id: filters.companyId })
      };
      const response = await api.get('/daily-requests/report/payments', { params });
      setReportData(response.data);
      if (response.data.length === 0) {
        showDialog({ title: 'Sem resultados', text: 'Nenhum registro encontrado para o período selecionado.', icon: 'info' });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      showDialog({ title: 'Erro', text: 'Não foi possível gerar o relatório.', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reportData.length === 0) return;

    const formattedData = reportData.map(item => ({
      'Data': new Date(item.date).toLocaleDateString('pt-BR'),
      'Empresa': item.company_name,
      'Colaborador': item.employee_name,
      'Horário': item.shift_time,
      'Status': item.status,
      'Valor (R$)': item.amount
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagamentos");
    XLSX.writeFile(wb, `Pagamentos_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="text-space-orange" />
            Relatório de Pagamentos
          </h1>
          <p className="text-gray-500">Gere relatórios de pagamentos por período e empresa.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="pl-9 w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="pl-9 w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                name="companyId"
                value={filters.companyId}
                onChange={handleFilterChange}
                className="pl-9 w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
              >
                <option value="">Todas as Empresas</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-space-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Buscando...' : <><Search size={18} /> Filtrar</>}
            </button>

            {reportData.length > 0 && (
              <button
                type="button"
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                title="Exportar Excel"
              >
                <Download size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shift_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      R$ {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Carregando...' : 'Nenhum pagamento encontrado. Selecione os filtros para buscar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
