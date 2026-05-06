'use server'

import { listProductsAction } from './products'
import { listClientesAction } from './clients'

export interface StockStats {
  totalItens: number
  totalProdutos: number
  abaixoMinimo: number
  semEstoque: number
  valorTotal: number
}

export interface DashboardStats {
  stock: StockStats
  totalClientes: number
}

export async function getDashboardStatsAction(): Promise<DashboardStats> {
  const [produtos, clientes] = await Promise.all([
    listProductsAction().catch(() => []),
    listClientesAction().catch(() => []),
  ])

  const ativos = produtos.filter((p) => p.ativo)

  const stock: StockStats = {
    totalItens: ativos.reduce((acc, p) => acc + p.qtd, 0),
    totalProdutos: ativos.length,
    abaixoMinimo: ativos.filter((p) => p.qtd > 0 && p.qtd < p.qtdMin).length,
    semEstoque: ativos.filter((p) => p.qtd === 0).length,
    valorTotal: ativos.reduce((acc, p) => acc + p.preco * p.qtd, 0),
  }

  return {
    stock,
    totalClientes: clientes.filter((c) => c.ativo).length,
  }
}
