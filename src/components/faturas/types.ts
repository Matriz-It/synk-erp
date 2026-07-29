export type FaturaStatus = 'pendente' | 'pago' | 'cancelado'
export type FaturaDisplayStatus = 'pendente' | 'vencida' | 'pago' | 'cancelado'

export interface Fatura {
  id: string
  numero: number
  cicloInicio: string   // YYYY-MM-DD
  cicloFim: string      // YYYY-MM-DD
  vencimento: string    // YYYY-MM-DD
  valor: number
  status: FaturaStatus
  pagoEm?: string
  valorPago?: number
  criadoEm: string
}

export const STATUS_FATURA: Record<FaturaDisplayStatus, { label: string; bg: string; color: string; dot: string }> = {
  pendente:  { label: 'Pendente',  bg: '#EEF0FF', color: '#3D3EBF', dot: '#3D3EBF' },
  vencida:   { label: 'Vencida',   bg: '#FEE2E2', color: '#EF4444', dot: '#EF4444' },
  pago:      { label: 'Pago',      bg: '#D1FAE5', color: '#14B87E', dot: '#14B87E' },
  cancelado: { label: 'Cancelado', bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
}

/** "Vencida" não é um status armazenado — é derivado comparando o vencimento com hoje. */
export function computeDisplayStatus(fatura: Fatura): FaturaDisplayStatus {
  if (fatura.status === 'pago') return 'pago'
  if (fatura.status === 'cancelado') return 'cancelado'
  const today = new Date().toISOString().split('T')[0]
  return fatura.vencimento <= today ? 'vencida' : 'pendente'
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
}
