/**
 * Converte erros de validação do FastAPI/Pydantic em mensagens legíveis em português.
 *
 * @param {import('axios').AxiosError} error - Erro capturado do axios
 * @param {string} [fallback='Ocorreu um erro inesperado.'] - Mensagem padrão
 * @returns {string} Mensagem formatada em português
 */
export function parseApiError(error, fallback = 'Ocorreu um erro inesperado.') {
  const detail = error.response?.data?.detail;

  if (!detail) return fallback;

  // Caso simples: backend retorna string direta (ex: "CPF já cadastrado")
  if (typeof detail === 'string') return detail;

  // Caso de validação: Pydantic retorna array de objetos
  if (Array.isArray(detail)) {
    return detail
      .map(err => {
        const rawField = err.loc?.slice(-1)[0] || 'campo';
        const field = FIELD_NAMES[rawField] || rawField;
        const msg = translateMessage(err.msg);
        return `${field}: ${msg}`;
      })
      .join('\n');
  }

  return fallback;
}

// ─── Mapa de campos → nome em português ──────────────────────
const FIELD_NAMES = {
  first_name: 'Nome',
  last_name: 'Sobrenome',
  cpf: 'CPF',
  email: 'E-mail',
  password: 'Senha',
  role: 'Função',
  name: 'Nome',
  tax_id: 'CNPJ',
  phone: 'Telefone',
  contact_person: 'Pessoa de contato',
  is_active: 'Status',
  shift_id: 'Turno',
  employee_id: 'Colaborador',
  request_date: 'Data',
  status: 'Status',
  start_time: 'Horário início',
  end_time: 'Horário fim',
  payment_amount: 'Valor',
  quantity: 'Quantidade',
};

// ─── Tradução de mensagens comuns do Pydantic ────────────────
function translateMessage(msg) {
  return msg
    .replace(/String should have at least (\d+) characters?/i, 'Deve ter pelo menos $1 caracteres')
    .replace(/String should have at most (\d+) characters?/i, 'Deve ter no máximo $1 caracteres')
    .replace(/Field required/i, 'Campo obrigatório')
    .replace(/value is not a valid email address/i, 'Endereço de e-mail inválido')
    .replace(/Value error, /i, '')
    .replace(/ensure this value is greater than (\d+)/i, 'O valor deve ser maior que $1')
    .replace(/ensure this value is less than (\d+)/i, 'O valor deve ser menor que $1')
    .replace(/Input should be a valid (.+)/i, 'Deve ser um(a) $1 válido(a)')
    .replace(/Input should be '(.+)'/i, "O valor deve ser '$1'");
}
