'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Pedido, PedidoItem, StatusPedido } from '@/components/orders/types'
import type { OrderDetail } from './orders'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

interface PurchaseOrderPayload {
  clientId: string
  status: StatusPedido
  obs: string
  descontoGlobal: number
  formaPagamento: string
  dataPagamento: string
  items: PedidoItem[]
}

function buildBody(data: PurchaseOrderPayload) {
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

export async function listPurchaseOrdersAction(params: Record<string, string> = {}): Promise<Pedido[]> {
  const qs = new URLSearchParams(params).toString()
  try { return await apiGet<Pedido[]>(`/purchase-orders${qs ? '?' + qs : ''}`) }
  catch (err) { return handleAuth(err) }
}

export async function getPurchaseOrderAction(id: string): Promise<OrderDetail> {
  try { return await apiGet<OrderDetail>(`/purchase-orders/${id}`) }
  catch (err) { return handleAuth(err) }
}

export async function createPurchaseOrderAction(data: PurchaseOrderPayload): Promise<Pedido> {
  try { return await apiPost<Pedido>('/purchase-orders', buildBody(data)) }
  catch (err) { return handleAuth(err) }
}

export async function updatePurchaseOrderAction(id: string, data: PurchaseOrderPayload): Promise<Pedido> {
  try { return await apiPatch<Pedido>(`/purchase-orders/${id}`, buildBody(data)) }
  catch (err) { return handleAuth(err) }
}

export async function deletePurchaseOrderAction(id: string): Promise<void> {
  try { await apiDelete(`/purchase-orders/${id}`) }
  catch (err) { handleAuth(err) }
}
