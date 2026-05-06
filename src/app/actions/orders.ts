'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Pedido, PedidoItem, StatusPedido } from '@/components/orders/types'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export interface OrderDetail extends Pedido {
  items: Array<{
    id: string
    productId: string
    nome: string
    sku: string
    preco: number
    qtd: number
    desconto: number
    total: number
  }>
}

export async function listOrdersAction(params: Record<string, string> = {}): Promise<Pedido[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    return await apiGet<Pedido[]>(`/orders${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function getOrderAction(id: string): Promise<OrderDetail> {
  try {
    return await apiGet<OrderDetail>(`/orders/${id}`)
  } catch (err) {
    return handleAuth(err)
  }
}

interface OrderPayload {
  clientId: string
  status: StatusPedido
  obs: string
  descontoGlobal: number
  formaPagamento: string
  dataPagamento: string
  items: PedidoItem[]
}

function buildOrderBody(data: OrderPayload) {
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

export async function createOrderAction(data: OrderPayload): Promise<Pedido> {
  try {
    return await apiPost<Pedido>('/orders', buildOrderBody(data))
  } catch (err) {
    return handleAuth(err)
  }
}

export async function updateOrderFullAction(id: string, data: OrderPayload): Promise<Pedido> {
  try {
    return await apiPatch<Pedido>(`/orders/${id}`, buildOrderBody(data))
  } catch (err) {
    return handleAuth(err)
  }
}

export async function updateOrderAction(
  id: string,
  dto: { status?: StatusPedido; obs?: string },
): Promise<Pedido> {
  try {
    return await apiPatch<Pedido>(`/orders/${id}`, dto)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function deleteOrderAction(id: string): Promise<void> {
  try {
    await apiDelete(`/orders/${id}`)
  } catch (err) {
    handleAuth(err)
  }
}
