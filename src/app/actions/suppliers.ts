'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Cliente } from '@/components/clients/types'

// Fornecedor usa a mesma estrutura de dados que Cliente
export type Fornecedor = Cliente

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listSuppliersAction(params: Record<string, string> = {}): Promise<Fornecedor[]> {
  const qs = new URLSearchParams(params).toString()
  try { return await apiGet<Fornecedor[]>(`/suppliers${qs ? '?' + qs : ''}`) }
  catch (err) { return handleAuth(err) }
}

export async function createSupplierAction(dto: Omit<Fornecedor, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>): Promise<Fornecedor> {
  try { return await apiPost<Fornecedor>('/suppliers', dto) }
  catch (err) { return handleAuth(err) }
}

export async function updateSupplierAction(
  id: string,
  dto: Partial<Omit<Fornecedor, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>>,
): Promise<Fornecedor> {
  try { return await apiPatch<Fornecedor>(`/suppliers/${id}`, dto) }
  catch (err) { return handleAuth(err) }
}

export async function deleteSupplierAction(id: string): Promise<void> {
  try { await apiDelete(`/suppliers/${id}`) }
  catch (err) { handleAuth(err) }
}
