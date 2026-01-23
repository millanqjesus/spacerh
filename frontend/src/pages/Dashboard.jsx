import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, Users } from 'lucide-react';
import api from '../services/api';
import DateCompanyFilter from '../components/DateCompanyFilter';
import { showDialog } from '../utils/alert';

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default dates: First day of current month to Last day of current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [filters, setFilters] = useState({
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
    companyId: ''
  });

  const STATUS_COLORS = {
    'PRESENTE': '#10B981', // Green
    'FALTOU': '#EF4444',   // Red
    'ASIGNADO': '#3B82F6', // Blue
    'CANCELADO': '#9CA3AF' // Gray
  };

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies/');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        ...(filters.companyId && { company_id: filters.companyId })
      };

      const [dashboardRes, attendanceRes] = await Promise.all([
        api.get('/daily-requests/stats/dashboard', { params }),
        api.get('/daily-requests/stats/attendance', { params })
      ]);

      setStats(dashboardRes.data);
      setAttendanceStats(attendanceRes.data);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showDialog({ title: 'Erro', text: 'Não foi possível carregar os dados do dashboard.', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const processedAttendanceData = useMemo(() => {
    if (attendanceStats.length === 0) return [];

    const grouped = attendanceStats.reduce((acc, curr) => {
      const company = curr.company_name;
      if (!acc[company]) {
        acc[company] = { company_name: company };
      }
      acc[company][curr.status] = curr.count;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.company_name.localeCompare(b.company_name));
  }, [attendanceStats]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStats();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-space-orange" />
            Dashboard
          </h1>
          <p className="text-gray-500">Visão geral das solicitações e atendimentos.</p>
        </div>
      </div>

      {/* Filtros */}
      <DateCompanyFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        companies={companies}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Solicitações por Empresa */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-gray-400" />
            Solicitações por Empresa
          </h2>

          {stats.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="company_name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{
                      backgroundColor: '#FFF',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="request_count"
                    name="Solicitações"
                    fill="#FF6B00"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <BarChart2 size={48} className="mb-2 opacity-50" />
              <p>Nenhum dado encontrado.</p>
            </div>
          )}
        </div>

        {/* Gráfico de Barras Apiladas - Status de Presença por Empresa */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            Presença por Empresa
          </h2>

          {processedAttendanceData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedAttendanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="company_name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{
                      backgroundColor: '#FFF',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="PRESENTE" name="Presente" stackId="a" fill={STATUS_COLORS['PRESENTE']} />
                  <Bar dataKey="FALTOU" name="Faltou" stackId="a" fill={STATUS_COLORS['FALTOU']} />
                  <Bar dataKey="ASIGNADO" name="Asignado" stackId="a" fill={STATUS_COLORS['ASIGNADO']} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <Users size={48} className="mb-2 opacity-50" />
              <p>Nenhum dado de presença.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

