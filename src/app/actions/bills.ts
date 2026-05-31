'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Conta } from '@/components/finance/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listBillsAction(params: Record<string, string> = {}): Promise<Conta[]> {
  const qs = new URLSearchParams(params).toString()
  try { return await apiGet<Conta[]>(`/bills${qs ? '?' + qs : ''}`) }
  catch (err) { return handleAuth(err) }
}

export async function createBillAction(dto: Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>): Promise<Conta> {
  try { return await apiPost<Conta>('/bills', dto) }
  catch (err) { return handleAuth(err) }
}

export async function updateBillAction(id: string, dto: Partial<Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>>): Promise<Conta> {
  try { return await apiPatch<Conta>(`/bills/${id}`, dto) }
  catch (err) { return handleAuth(err) }
}

export async function payBillAction(id: string, pagoEm: string, valorPago?: number): Promise<Conta> {
  try { return await apiPost<Conta>(`/bills/${id}/pay`, { pagoEm, valorPago }) }
  catch (err) { return handleAuth(err) }
}

export async function deleteBillAction(id: string): Promise<void> {
  try { await apiDelete(`/bills/${id}`) }
  catch (err) { handleAuth(err) }
}
