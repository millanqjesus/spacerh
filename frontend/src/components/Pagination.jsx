import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de paginação reutilizável.
 *
 * @param {object}   props
 * @param {number}   props.currentPage   – Página atual (1-based).
 * @param {number}   props.totalPages    – Total de páginas.
 * @param {number}   props.totalItems    – Total de registros.
 * @param {number}   props.startIndex    – Índice inicial (0-based).
 * @param {number}   props.endIndex      – Índice final (exclusive).
 * @param {function} props.goToPage      – Navegar para uma página específica.
 * @param {function} props.nextPage      – Ir para a próxima página.
 * @param {function} props.prevPage      – Ir para a página anterior.
 * @param {boolean}  props.isFirstPage   – É a primeira página?
 * @param {boolean}  props.isLastPage    – É a última página?
 * @param {Array}    props.pageNumbers   – Array de números de página (null = reticências).
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  goToPage,
  nextPage,
  prevPage,
  isFirstPage,
  isLastPage,
  pageNumbers,
}) {
  if (totalItems === 0) return null;

  return (
    <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Info de registros */}
      <span className="text-sm text-gray-700">
        Mostrando{' '}
        <span className="font-medium">{startIndex + 1}</span> a{' '}
        <span className="font-medium">{endIndex}</span> de{' '}
        <span className="font-medium">{totalItems}</span> resultados
      </span>

      {/* Controles de paginação */}
      <div className="flex items-center gap-1">
        {/* Botão Anterior */}
        <button
          onClick={prevPage}
          disabled={isFirstPage}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>

        {/* Números de página */}
        {pageNumbers.map((page, idx) =>
          page === null ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-400 text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors
                ${
                  page === currentPage
                    ? 'bg-space-orange text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Botão Próximo */}
        <button
          onClick={nextPage}
          disabled={isLastPage}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Próxima página"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
