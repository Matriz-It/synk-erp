'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPost, ApiError } from '@/lib/api'

export interface LancamentoCaixa {
  id: string
  data: string
  descricao: string
  origem: string
  tipo: 'entrada' | 'saida'
  valor: number
  categoria: string
}

export interface CashflowResponse {
  saldoInicial: number
  totais: {
    entradas: number
    saidas:   number
    saldo:    number
    saldoAtual: number
  }
  lancamentos: LancamentoCaixa[]
}

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function getCashflowAction(params: {
  mes?: string
  tipo?: string
  search?: string
} = {}): Promise<CashflowResponse> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')) as Record<string, string>
  ).toString()
  try {
    return await apiGet<CashflowResponse>(`/cashflow${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function createCashEntryAction(dto: {
  descricao: string
  tipo: 'entrada' | 'saida'
  valor: number
}): Promise<LancamentoCaixa> {
  try {
    return await apiPost<LancamentoCaixa>('/cashflow', dto)
  } catch (err) {
    return handleAuth(err)
  }
}
