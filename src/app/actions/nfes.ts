'use server'

import { redirect } from 'next/navigation'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export type NFeStatus = 'rascunho' | 'autorizada' | 'rejeitada' | 'cancelada'

export interface Nfe {
  id: string
  numero: number
  serie: string
  dataEmissao: string
  dataSaida: string | null
  naturezaOperacao: string
  finalidade: string
  clienteId: string
  cliente: string
  clienteCnpj: string
  status: NFeStatus
  chaveAcesso: string | null
  protocolo: string | null
  valorTotal: number
  criadoEm: string
}

export interface NfeItem {
  id: string
  produtoId: string | null
  sku: string
  nome: string
  qtd: number
  preco: number
  desconto: number
  cfop: string
  cst: string
  bcICMS: number
  aliqICMS: number
  valorICMS: number
  total: number
}

export interface NfeVencimento {
  id: string
  data: string
  valor: number
  obs: string | null
}

export interface NfeDetail extends Nfe {
  baseICMS: number
  valorICMS: number
  baseIBS: number
  valorIBS: number
  valorCBS: number
  valorFrete: number
  valorSeguro: number
  valorDesconto: number
  valorOutro: number
  modalidadeFrete: string
  transportadora: string | null
  placaVeiculo: string | null
  pesoLiquido: number | null
  pesoBruto: number | null
  qtdVolumes: number | null
  especieVolumes: string | null
  obsContribuinte: string | null
  obsFisco: string | null
  numeroPedido: string | null
  numeroContrato: string | null
  items: NfeItem[]
  vencimentos: NfeVencimento[]
}

export interface NfePayload {
  clientId: string
  dataEmissao: string
  dataSaida?: string
  naturezaOperacao: string
  finalidade: string
  serie?: string
  status?: NFeStatus
  baseICMS?: number
  valorICMS?: number
  baseIBS?: number
  valorIBS?: number
  valorCBS?: number
  valorFrete?: number
  valorSeguro?: number
  valorDesconto?: number
  valorOutro?: number
  valorTotal?: number
  modalidadeFrete?: string
  transportadora?: string
  placaVeiculo?: string
  pesoLiquido?: number
  pesoBruto?: number
  qtdVolumes?: number
  especieVolumes?: string
  obsContribuinte?: string
  obsFisco?: string
  numeroPedido?: string
  numeroContrato?: string
  items: Array<{
    produtoId?: string
    sku: string
    nome: string
    qtd: number
    preco: number
    desconto?: number
    cfop: string
    cst: string
    bcICMS?: number
    aliqICMS?: number
    valorICMS?: number
  }>
  vencimentos?: Array<{
    data: string
    valor: number
    obs?: string
  }>
}

export async function listNfesAction(params: Record<string, string> = {}): Promise<Nfe[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    return await apiGet<Nfe[]>(`/nfes${qs ? '?' + qs : ''}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function getNfeAction(id: string): Promise<NfeDetail> {
  try {
    return await apiGet<NfeDetail>(`/nfes/${id}`)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function createNfeAction(data: NfePayload): Promise<NfeDetail> {
  try {
    return await apiPost<NfeDetail>('/nfes', data)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function updateNfeAction(id: string, data: Partial<NfePayload>): Promise<NfeDetail> {
  try {
    return await apiPatch<NfeDetail>(`/nfes/${id}`, data)
  } catch (err) {
    return handleAuth(err)
  }
}

export async function deleteNfeAction(id: string): Promise<void> {
  try {
    await apiDelete(`/nfes/${id}`)
  } catch (err) {
    handleAuth(err)
  }
}
