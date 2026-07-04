export interface Servico {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  preco: number
  precoCusto: number | null
  ativo: boolean
  criadoEm: string
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
