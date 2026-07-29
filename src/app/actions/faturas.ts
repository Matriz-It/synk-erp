'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import type { Fatura } from '@/components/faturas/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listFaturasAction(): Promise<Fatura[]> {
  try { return await apiGet<Fatura[]>('/faturas') }
  catch (err) { return handleAuth(err) }
}

export interface PagarFaturaInput {
  paymentType: 'creditCard' | 'debitCard' | 'ticket' | 'bank_transfer'
  paymentMethodId: string
  token?: string
  installments?: number
  issuerId?: number
  payerEmail: string
  payerIdentification?: { type: string; number: string }
}

export interface PagamentoResult {
  status: string
  statusDetail?: string
  mpPaymentId: string | null
  pix?: { qrCode: string; qrCodeBase64: string | null }
  boleto?: { barcode?: string; digitableLine?: string; url?: string }
  fatura: Fatura
}

export async function pagarFaturaAction(faturaId: string, input: PagarFaturaInput): Promise<PagamentoResult> {
  try { return await apiPost<PagamentoResult>(`/faturas/${faturaId}/pagamento`, input) }
  catch (err) { return handleAuth(err) }
}
