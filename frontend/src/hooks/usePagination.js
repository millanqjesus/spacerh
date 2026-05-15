import { useState, useMemo, useCallback } from 'react';

/**
 * Hook reutilizável de paginação do lado do cliente.
 *
 * @param {Array}  items       – lista completa de itens (já filtrados, se aplicável).
 * @param {number} [perPage=10] – quantidade de itens por página.
 *
 * @returns {{
 *   currentPage:  number,
 *   totalPages:   number,
 *   paginatedItems: Array,
 *   startIndex:   number,
 *   endIndex:     number,
 *   totalItems:   number,
 *   goToPage:     (page: number) => void,
 *   nextPage:     () => void,
 *   prevPage:     () => void,
 *   resetPage:    () => void,
 *   isFirstPage:  boolean,
 *   isLastPage:   boolean,
 *   pageNumbers:  number[],
 * }}
 */
export default function usePagination(items = [], perPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Recalcula sempre que a lista ou o tamanho da página mudar
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Garantir que currentPage não exceda totalPages (ex: após um filtro)
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * perPage;           // 0-based
  const endIndex   = Math.min(startIndex + perPage, totalItems); // exclusive

  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex],
  );

  // ---------- Navegação ----------
  const goToPage = useCallback(
    (page) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => goToPage(safePage + 1), [goToPage, safePage]);
  const prevPage = useCallback(() => goToPage(safePage - 1), [goToPage, safePage]);

  /** Volta para a primeira página (útil ao alterar filtros). */
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // ---------- Helpers ----------
  const isFirstPage = safePage === 1;
  const isLastPage  = safePage === totalPages;

  /**
   * Gera um array de números de página com reticências (null).
   * Exemplo: [1, null, 4, 5, 6, null, 10]
   */
  const pageNumbers = useMemo(() => {
    const delta = 1; // páginas adjacentes a exibir
    const range = [];

    for (
      let i = Math.max(2, safePage - delta);
      i <= Math.min(totalPages - 1, safePage + delta);
      i++
    ) {
      range.push(i);
    }

    // Adicionar primeira página e reticências se necessário
    if (safePage - delta > 2) range.unshift(null);
    range.unshift(1);

    // Adicionar última página e reticências se necessário
    if (safePage + delta < totalPages - 1) range.push(null);
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [safePage, totalPages]);

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    startIndex,              // 0-based
    endIndex,                // exclusive
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    isFirstPage,
    isLastPage,
    pageNumbers,
  };
}
