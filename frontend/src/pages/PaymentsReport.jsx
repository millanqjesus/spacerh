import { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Filter, Building, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { showDialog } from '../utils/alert';

export default function PaymentsReport() {
  const [companies, setCompanies] = useState([]);

  // Default dates: First day of current month to Last day of current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [filters, setFilters] = useState({
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
    companyId: ''
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
    // Auto-fetch data on mount
    fetchReportData(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies/');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchReportData = async (start, end, companyId = '') => {
    setLoading(true);
    try {
      const params = {
        start_date: start,
        end_date: end,
        ...(companyId && { company_id: companyId })
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.startDate || !filters.endDate) {
      showDialog({ title: 'Atenção', text: 'Selecione as datas de início e fim.', icon: 'warning' });
      return;
    }
    fetchReportData(filters.startDate, filters.endDate, filters.companyId);
  };

  /* Removed groupedData useMemo as data comes grouped from backend */

  const exportToExcel = () => {
    if (reportData.length === 0) return;

    const formattedData = reportData.map((item, index) => ({
      '#': index + 1,
      'Colaborador': item.employee_name,
      'Valor a Pagar (R$)': item.total_amount
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagamentos por Colaborador");
    XLSX.writeFile(wb, `Pagamentos_Agrupados_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="text-space-orange" />
            Relatório de Pagamentos
          </h1>
          <p className="text-gray-500">Relatório consolidado de pagamentos por colaborador.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <div className="relative">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor a Pagar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      R$ {item.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Carregando...' : 'Nenhum pagamento encontrado. Selecione os filtros para buscar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación Visual */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{reportData.length}</span> de <span className="font-medium">{reportData.length}</span> resultados
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
      </div>
    </div>
  );
}
