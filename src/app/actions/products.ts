'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'
import type { Produto, Movimentacao } from '@/components/products/types'

interface ProductDetail extends Produto {
  movimentacoes: Movimentacao[]
}

function handleAuthError(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function listProductsAction(params: Record<string, string> = {}): Promise<Produto[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    return await apiGet<Produto[]>(`/products${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function getProductDetailAction(id: string): Promise<ProductDetail> {
  try {
    return await apiGet<ProductDetail>(`/products/${id}`)
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function createProductAction(dto: {
  sku: string
  nome: string
  categoria: string
  preco: number
  qtdInicial?: number
  qtdMin?: number
  foto?: string | null
  ativo?: boolean
}): Promise<Produto> {
  try {
    return await apiPost<Produto>('/products', dto)
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function updateProductAction(
  id: string,
  dto: Partial<{ sku: string; nome: string; categoria: string; preco: number; qtdMin: number; foto: string | null; ativo: boolean }>,
): Promise<Produto> {
  try {
    return await apiPatch<Produto>(`/products/${id}`, dto)
  } catch (err) {
    return handleAuthError(err)
  }
}

export async function createMovementAction(
  productId: string,
  dto: { tipo: 'entrada' | 'saida'; qtd: number; motivo: string },
): Promise<Movimentacao> {
  try {
    return await apiPost<Movimentacao>(`/products/${productId}/movements`, dto)
  } catch (err) {
    return handleAuthError(err)
  }
}
