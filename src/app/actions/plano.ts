'use server'

import { redirect } from 'next/navigation'
import { apiPatch, ApiError } from '@/lib/api'
import type { Fatura } from '@/components/faturas/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export type PlanoSelecionavel = 'pro' | 'business'

export interface UpdatePlanoResult {
  plan: string
  fatura: Fatura
}

export async function updatePlanoAction(plan: PlanoSelecionavel): Promise<UpdatePlanoResult> {
  try { return await apiPatch<UpdatePlanoResult>('/faturas/plano', { plan }) }
  catch (err) { return handleAuth(err) }
}
