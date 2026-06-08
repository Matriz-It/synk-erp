// Statuses exclusivos de orçamentos
export type StatusOrcamento = 'rascunho' | 'pendente' | 'aprovado' | 'cancelado' | 'concluido'
// Statuses exclusivos de pedidos de venda
export type StatusPedidoOrder = 'pendente' | 'em_andamento' | 'entregue' | 'concluido'
// Statuses exclusivos de pedidos de compra
export type StatusCompra = 'recebido' | 'cancelado'
// União genérica usada no componente compartilhado
export type StatusPedido = StatusOrcamento | StatusPedidoOrder | StatusCompra

export interface Pedido {
  id: string       // UUID — usado em chamadas à API
  numero: number   // número sequencial exibido (#1082)
  cliente: string
  clienteId: string
  status: StatusPedido
  itens: number
  subtotal: number
  desconto: number
  total: number
  criadoEm: string
  obs: string
  formaPagamento: string | null
  dataPagamento: string | null
}

export const FORMAS_PAGAMENTO = [
  { value: 'dinheiro',       label: 'Dinheiro' },
  { value: 'pix',            label: 'Pix' },
  { value: 'cartao_credito', label: 'Cartão de crédito' },
  { value: 'cartao_debito',  label: 'Cartão de débito' },
  { value: 'boleto',         label: 'Boleto' },
  { value: 'transferencia',  label: 'Transferência bancária' },
  { value: 'cheque',         label: 'Cheque' },
  { value: 'faturado',       label: 'A prazo / Faturado' },
] as const

export interface PedidoItem {
  prodId: string
  nome: string
  sku: string
  preco: number
  qtd: number
  maxQtd: number
  desconto: string
}

export const STATUS_CFG: Record<StatusPedido, { label: string; bg: string; color: string; dot: string }> = {
  // Orçamento
  rascunho:    { label: 'Rascunho',     bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  aprovado:    { label: 'Aprovado',     bg: '#D1FAE5', color: '#14B87E', dot: '#14B87E' },
  cancelado:   { label: 'Cancelado',    bg: '#FEE2E2', color: '#EF4444', dot: '#EF4444' },
  // Compartilhado (orçamento pendente / pedido pendente)
  pendente:    { label: 'Pendente',     bg: '#FEF3C7', color: '#F59E0B', dot: '#F59E0B' },
  // Pedido
  em_andamento: { label: 'Em andamento', bg: '#EEF0FF', color: '#3D3EBF', dot: '#3D3EBF' },
  entregue:    { label: 'Entregue',     bg: '#D1FAE5', color: '#14B87E', dot: '#14B87E' },
  concluido:   { label: 'Concluído',    bg: '#F1F5F9', color: '#334155', dot: '#64748B' },
  // Pedido de compra
  recebido:    { label: 'Recebido',     bg: '#EEF0FF', color: '#3D3EBF', dot: '#3D3EBF' },
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
}
