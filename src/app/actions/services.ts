'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Servico } from '@/components/services/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listServicesAction(params: Record<string, string> = {}): Promise<Servico[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    return await apiGet<Servico[]>(`/services${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function createServiceAction(dto: {
  codigo: string
  nome: string
  descricao?: string
  preco: number
  precoCusto?: number | null
  ativo?: boolean
}): Promise<Servico> {
  try {
    return await apiPost<Servico>('/services', dto)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function updateServiceAction(
  id: string,
  dto: Partial<{ codigo: string; nome: string; descricao: string; preco: number; precoCusto: number | null; ativo: boolean }>,
): Promise<Servico> {
  try {
    return await apiPatch<Servico>(`/services/${id}`, dto)
  } catch (err) {
    return handleAuth(err)
  }
}
