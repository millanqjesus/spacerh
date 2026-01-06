import { FileText, Download } from 'lucide-react';

export default function PaymentsReport() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Relatório de Pagamentos</h1>
          <p className="text-gray-500">Visualize e baixe relatórios financeiros.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 cursor-not-allowed px-5 py-2.5 rounded-lg font-medium text-sm">
          <Download size={18} />
          Exportar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Em breve...</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Estamos trabalhando para trazer relatórios detalhados de pagamentos e faturamento.
          <br />Disponível nas próximas atualizações.
        </p>
      </div>
    </div>
  );
}
