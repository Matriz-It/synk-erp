'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Cliente } from '@/components/clients/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listClientesAction(params: Record<string, string> = {}): Promise<Cliente[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    return await apiGet<Cliente[]>(`/clients${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function createClienteAction(dto: Omit<Cliente, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>): Promise<Cliente> {
  try {
    return await apiPost<Cliente>('/clients', dto)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function updateClienteAction(
  id: string,
  dto: Partial<Omit<Cliente, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>>,
): Promise<Cliente> {
  try {
    return await apiPatch<Cliente>(`/clients/${id}`, dto)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function deleteClienteAction(id: string): Promise<void> {
  try {
    await apiDelete(`/clients/${id}`)
  } catch (err) {
    handleAuth(err)
  }
}
