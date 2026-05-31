'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Conta } from '@/components/finance/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listReceivablesAction(params: Record<string, string> = {}): Promise<Conta[]> {
  const qs = new URLSearchParams(params).toString()
  try { return await apiGet<Conta[]>(`/receivables${qs ? '?' + qs : ''}`) }
  catch (err) { return handleAuth(err) }
}

export async function createReceivableAction(dto: Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>): Promise<Conta> {
  try { return await apiPost<Conta>('/receivables', dto) }
  catch (err) { return handleAuth(err) }
}

export async function updateReceivableAction(id: string, dto: Partial<Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>>): Promise<Conta> {
  try { return await apiPatch<Conta>(`/receivables/${id}`, dto) }
  catch (err) { return handleAuth(err) }
}

export async function receiveReceivableAction(id: string, pagoEm: string, valorPago?: number): Promise<Conta> {
  try { return await apiPost<Conta>(`/receivables/${id}/receive`, { pagoEm, valorPago }) }
  catch (err) { return handleAuth(err) }
}

export async function deleteReceivableAction(id: string): Promise<void> {
  try { await apiDelete(`/receivables/${id}`) }
  catch (err) { handleAuth(err) }
}
