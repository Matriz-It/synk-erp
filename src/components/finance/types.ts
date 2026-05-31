export type ContaStatus = 'aberto' | 'vencendo' | 'vencido' | 'pago'

export interface Conta {
  id: string
  numero: number
  parceiro: string
  descricao: string
  valor: number
  vencimento: string   // YYYY-MM-DD
  status: ContaStatus
  categoria: string
  obs: string
  pagoEm?: string      // YYYY-MM-DD
  criadoEm: string
}

export const STATUS_CONTA: Record<ContaStatus, { label: string; bg: string; color: string; dot: string }> = {
  aberto:   { label: 'Em aberto',  bg: '#EEF0FF', color: '#3D3EBF', dot: '#3D3EBF' },
  vencendo: { label: 'Vencendo',   bg: '#FEF3C7', color: '#F59E0B', dot: '#F59E0B' },
  vencido:  { label: 'Vencido',    bg: '#FEE2E2', color: '#EF4444', dot: '#EF4444' },
  pago:     { label: 'Pago',       bg: '#D1FAE5', color: '#14B87E', dot: '#14B87E' },
}

export const CATEGORIAS_PAGAR = [
  { value: 'aluguel',      label: 'Aluguel' },
  { value: 'fornecedores', label: 'Fornecedores' },
  { value: 'servicos',     label: 'Serviços' },
  { value: 'impostos',     label: 'Impostos' },
  { value: 'salarios',     label: 'Salários' },
  { value: 'outros',       label: 'Outros' },
] as const

export const CATEGORIAS_RECEBER = [
  { value: 'vendas',       label: 'Vendas' },
  { value: 'servicos',     label: 'Serviços' },
  { value: 'devolucao',    label: 'Devolução' },
  { value: 'outros',       label: 'Outros' },
] as const

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
}

export const CONTAS_PAGAR_MOCK: Conta[] = [
  { id: '1', numero: 101, parceiro: 'Locadora ABC',          descricao: 'Aluguel maio/2026',       valor: 4500.00, vencimento: '2026-05-10', status: 'vencendo', categoria: 'aluguel',      obs: '',                          criadoEm: '2026-04-20' },
  { id: '2', numero: 102, parceiro: 'Distribuidora Café',    descricao: 'NF 8821 — insumos',       valor: 1800.00, vencimento: '2026-04-28', status: 'vencido',  categoria: 'fornecedores', obs: '',                          criadoEm: '2026-04-10' },
  { id: '3', numero: 103, parceiro: 'Telecom Fibra',         descricao: 'Internet abril/2026',     valor: 199.90,  vencimento: '2026-04-30', status: 'vencido',  categoria: 'servicos',     obs: '',                          criadoEm: '2026-04-01' },
  { id: '4', numero: 104, parceiro: 'Receita Federal',       descricao: 'DAS maio/2026',           valor: 2340.00, vencimento: '2026-05-20', status: 'aberto',   categoria: 'impostos',     obs: '',                          criadoEm: '2026-05-01' },
  { id: '5', numero: 105, parceiro: 'Fornecedor Geral Ltda', descricao: 'NF 9012 — embalagens',   valor: 6720.00, vencimento: '2026-05-30', status: 'aberto',   categoria: 'fornecedores', obs: 'Parcelado em 2x',           criadoEm: '2026-04-28' },
  { id: '6', numero: 100, parceiro: 'ENEL Distribuição',     descricao: 'Energia elétrica março', valor: 890.00,  vencimento: '2026-04-05', status: 'pago',     categoria: 'servicos',     obs: '', pagoEm: '2026-04-04',    criadoEm: '2026-03-20' },
]

export const CONTAS_RECEBER_MOCK: Conta[] = [
  { id: '1', numero: 1042, parceiro: 'Lima Distribuidora Ltda', descricao: 'Pedido #1042',   valor: 4120.00, vencimento: '2026-04-12', status: 'vencido',  categoria: 'vendas', obs: '',                       criadoEm: '2026-04-01' },
  { id: '2', numero: 1056, parceiro: 'Padaria São Jorge',       descricao: 'Pedido #1056',   valor: 850.00,  vencimento: '2026-04-29', status: 'vencendo', categoria: 'vendas', obs: 'Cliente pediu prazo',     criadoEm: '2026-04-15' },
  { id: '3', numero: 1063, parceiro: 'Construtora Velez S.A.',  descricao: 'Pedido #1063',   valor: 12300.00,vencimento: '2026-04-30', status: 'vencendo', categoria: 'vendas', obs: '',                       criadoEm: '2026-04-18' },
  { id: '4', numero: 1071, parceiro: 'Mercado Boa Vista ME',    descricao: 'Pedido #1071',   valor: 2475.00, vencimento: '2026-05-05', status: 'aberto',   categoria: 'vendas', obs: '',                       criadoEm: '2026-04-22' },
  { id: '5', numero: 1024, parceiro: 'Loja do João',            descricao: 'Pedido #1024',   valor: 1980.00, vencimento: '2026-04-21', status: 'pago',     categoria: 'vendas', obs: '', pagoEm: '2026-04-20', criadoEm: '2026-04-10' },
  { id: '6', numero: 1080, parceiro: 'Café Central Comércio',   descricao: 'Pedido #1080',   valor: 640.00,  vencimento: '2026-05-08', status: 'aberto',   categoria: 'vendas', obs: '',                       criadoEm: '2026-04-25' },
  { id: '7', numero: 1082, parceiro: 'Lima Distribuidora Ltda', descricao: 'Pedido #1082',   valor: 13750.00,vencimento: '2026-05-25', status: 'aberto',   categoria: 'vendas', obs: '',                       criadoEm: '2026-05-01' },
]
