import { useState, useEffect, useMemo } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../services/api';
import DateCompanyFilter from '../components/DateCompanyFilter';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
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

  // Paginação: 10 registros por página
  const pagination = usePagination(reportData, 10);

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
      pagination.resetPage();
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

    const formattedData = reportData.map((item) => ({
      'Código': item.employee_code || '—',
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
      <div className="flex gap-4">
        <div className="flex-1">
          <DateCompanyFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            companies={companies}
            loading={loading}
          />
        </div>

        {reportData.length > 0 && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 h-[42px]"
              title="Exportar Excel"
            >
              <Download size={18} />
            </button>
          </div>
        )}
      </div>


      {/* Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor a Pagar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagination.paginatedItems.length > 0 ? (
                pagination.paginatedItems.map((item) => (
                  <tr key={item.employee_code || item.employee_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono font-medium">
                      {item.employee_code || '—'}
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

          {/* Paginação */}
          <Pagination {...pagination} />
        </div>
      </div>
    </div>
  );
}
