import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook reutilizável que sincroniza filtros com os parâmetros da URL (query string).
 *
 * Isso garante que os filtros sejam preservados ao navegar para outra
 * página e voltar (ex: /requests → /requests/7 → voltar).
 *
 * @param {Record<string, string>} defaultValues – Valores padrão dos filtros.
 * @param {Record<string, string>} [paramMap]    – Mapeamento opcional de nomes de filtro → nomes de parâmetro na URL.
 *
 * @returns {{
 *   filters: Record<string, string>,
 *   handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
 *   setFilters: (updater: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void,
 *   buildQueryString: () => string,
 * }}
 */
export default function useFilterParams(defaultValues, paramMap = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializar filtros: priorizar valores da URL, depois os defaults
  const getInitialFilters = () => {
    const initial = {};
    for (const key of Object.keys(defaultValues)) {
      const urlKey = paramMap[key] || key;
      initial[key] = searchParams.get(urlKey) || defaultValues[key];
    }
    return initial;
  };

  const [filters, setFiltersState] = useState(getInitialFilters);

  // Sincroniza estado + URL
  const syncToUrl = useCallback(
    (newFilters) => {
      const params = {};
      for (const [key, value] of Object.entries(newFilters)) {
        if (value !== '' && value !== defaultValues[key]) {
          const urlKey = paramMap[key] || key;
          params[urlKey] = value;
        }
      }
      setSearchParams(params, { replace: true });
    },
    [defaultValues, paramMap, setSearchParams],
  );

  const setFilters = useCallback(
    (updater) => {
      setFiltersState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        syncToUrl(next);
        return next;
      });
    },
    [syncToUrl],
  );

  /** Handler para inputs/selects controlados (usa e.target.name). */
  const handleFilterChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [setFilters],
  );

  /**
   * Gera a query string atual dos filtros (útil para links).
   * Ex: "?startDate=2026-01-01&endDate=2026-01-31&companyId=3"
   */
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '') {
        const urlKey = paramMap[key] || key;
        params.set(urlKey, value);
      }
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [filters, paramMap]);

  return {
    filters,
    handleFilterChange,
    setFilters,
    buildQueryString,
  };
}
