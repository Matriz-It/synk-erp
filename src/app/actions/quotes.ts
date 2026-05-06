'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Pedido, PedidoItem, StatusPedido } from '@/components/orders/types'
import type { OrderDetail } from './orders'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listQuotesAction(params: Record<string, string> = {}): Promise<Pedido[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    return await apiGet<Pedido[]>(`/quotes${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function getQuoteAction(id: string): Promise<OrderDetail> {
  try {
    return await apiGet<OrderDetail>(`/quotes/${id}`)
  } catch (err) {
    return handleAuth(err)
  }
}

interface QuotePayload {
  clientId: string
  status: StatusPedido
  obs: string
  descontoGlobal: number
  formaPagamento: string
  dataPagamento: string
  items: PedidoItem[]
}

function buildBody(data: QuotePayload) {
  return {
    clientId: data.clientId,
    status: data.status,
    obs: data.obs || undefined,
    descontoGlobal: data.descontoGlobal || undefined,
    formaPagamento: data.formaPagamento || undefined,
    dataPagamento: data.dataPagamento || undefined,
    items: data.items.map((i) => ({
      productId: i.prodId,
      qtd: i.qtd,
      desconto: parseFloat(i.desconto) || undefined,
    })),
  }
}

export async function createQuoteAction(data: QuotePayload): Promise<Pedido> {
  try {
    return await apiPost<Pedido>('/quotes', buildBody(data))
  } catch (err) {
    return handleAuth(err)
  }
}

export async function updateQuoteFullAction(id: string, data: QuotePayload): Promise<Pedido> {
  try {
    return await apiPatch<Pedido>(`/quotes/${id}`, buildBody(data))
  } catch (err) {
    return handleAuth(err)
  }
}

export async function convertQuoteToOrderAction(id: string): Promise<Pedido> {
  try {
    return await apiPost<Pedido>(`/quotes/${id}/convert`, {})
  } catch (err) {
    return handleAuth(err)
  }
}

export async function deleteQuoteAction(id: string): Promise<void> {
  try {
    await apiDelete(`/quotes/${id}`)
  } catch (err) {
    handleAuth(err)
  }
}
