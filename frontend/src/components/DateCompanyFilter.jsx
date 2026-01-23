import { Search } from 'lucide-react';

export default function DateCompanyFilter({
  filters,
  onFilterChange,
  onSearch,
  companies = [],
  loading = false
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={onFilterChange}
            className="w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={onFilterChange}
            className="w-full rounded-lg border-gray-300 focus:ring-space-orange focus:border-space-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (Opcional)</label>
          <select
            name="companyId"
            value={filters.companyId}
            onChange={onFilterChange}
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
            disabled={loading}
            className="w-full bg-space-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : <><Search size={18} /> Filtrar</>}
          </button>
        </div>
      </form>
    </div>
  );
}
