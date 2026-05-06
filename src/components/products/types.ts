export interface Produto {
  id: string
  sku: string
  nome: string
  categoria: string
  preco: number
  qtd: number
  qtdMin: number
  foto: string | null
  ativo: boolean
  criadoEm: string
}

export interface Movimentacao {
  id: string
  tipo: 'entrada' | 'saida'
  qtd: number
  motivo: string
  data: string
  operador: string
  saldoApos: number
}

export type MovMap = Record<number, Movimentacao[]>

export const CATEGORIAS = [
  { id: 'all', label: 'Todos' },
  { id: 'alimentos', label: 'Alimentos' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'limpeza', label: 'Limpeza' },
  { id: 'eletronicos', label: 'Eletrônicos' },
  { id: 'papelaria', label: 'Papelaria' },
] as const

export const CAT_LABEL: Record<string, string> = {
  alimentos: 'Alimentos',
  bebidas: 'Bebidas',
  limpeza: 'Limpeza',
  eletronicos: 'Eletrônicos',
  papelaria: 'Papelaria',
}

export function stockStatus(p: Produto): 'ok' | 'low' | 'zero' {
  if (p.qtd === 0) return 'zero'
  if (p.qtd < p.qtdMin) return 'low'
  return 'ok'
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
}

export const PRODUTOS_MOCK: Produto[] = [
  { id: 1, sku: 'SKU-001', nome: 'Café Expresso 500g', categoria: 'alimentos', preco: 28.90, qtd: 142, qtdMin: 20, foto: null, ativo: true, criadoEm: '2026-01-10' },
  { id: 2, sku: 'SKU-002', nome: 'Água Mineral 500ml (cx 24un)', categoria: 'bebidas', preco: 18.50, qtd: 8, qtdMin: 10, foto: null, ativo: true, criadoEm: '2026-01-15' },
  { id: 3, sku: 'SKU-003', nome: 'Detergente Neutro 500ml', categoria: 'limpeza', preco: 4.20, qtd: 0, qtdMin: 15, foto: null, ativo: true, criadoEm: '2026-01-20' },
  { id: 4, sku: 'SKU-004', nome: 'Notebook Dell Inspiron 15"', categoria: 'eletronicos', preco: 3299.00, qtd: 5, qtdMin: 2, foto: null, ativo: true, criadoEm: '2026-02-01' },
  { id: 5, sku: 'SKU-005', nome: 'Resma de Papel A4 500fls', categoria: 'papelaria', preco: 32.00, qtd: 67, qtdMin: 10, foto: null, ativo: true, criadoEm: '2026-02-10' },
  { id: 6, sku: 'SKU-006', nome: 'Biscoito Cream Cracker 400g', categoria: 'alimentos', preco: 6.80, qtd: 3, qtdMin: 25, foto: null, ativo: false, criadoEm: '2026-02-15' },
  { id: 7, sku: 'SKU-007', nome: 'Refrigerante Cola 2L', categoria: 'bebidas', preco: 9.50, qtd: 44, qtdMin: 12, foto: null, ativo: true, criadoEm: '2026-03-01' },
  { id: 8, sku: 'SKU-008', nome: 'Mouse Wireless Logitech', categoria: 'eletronicos', preco: 189.90, qtd: 11, qtdMin: 3, foto: null, ativo: true, criadoEm: '2026-03-05' },
]

export const MOV_MOCK: MovMap = {
  1: [
    { id: 1, tipo: 'entrada', qtd: 100, motivo: 'Compra fornecedor', data: '2026-04-10', operador: 'Maria Silva', saldoApos: 142 },
    { id: 2, tipo: 'saida', qtd: 30, motivo: 'Venda pedido #1042', data: '2026-04-08', operador: 'Maria Silva', saldoApos: 42 },
    { id: 3, tipo: 'entrada', qtd: 50, motivo: 'Compra fornecedor', data: '2026-03-20', operador: 'João Costa', saldoApos: 72 },
    { id: 4, tipo: 'saida', qtd: 28, motivo: 'Venda pedido #1035', data: '2026-03-15', operador: 'Maria Silva', saldoApos: 22 },
  ],
  2: [
    { id: 5, tipo: 'entrada', qtd: 24, motivo: 'Compra fornecedor', data: '2026-04-05', operador: 'João Costa', saldoApos: 8 },
    { id: 6, tipo: 'saida', qtd: 16, motivo: 'Venda pedido #1040', data: '2026-04-03', operador: 'Maria Silva', saldoApos: 0 },
  ],
  3: [],
  4: [{ id: 7, tipo: 'entrada', qtd: 5, motivo: 'Compra fornecedor', data: '2026-03-01', operador: 'João Costa', saldoApos: 5 }],
  5: [
    { id: 8, tipo: 'entrada', qtd: 100, motivo: 'Compra fornecedor', data: '2026-02-15', operador: 'Maria Silva', saldoApos: 100 },
    { id: 9, tipo: 'saida', qtd: 33, motivo: 'Uso interno', data: '2026-03-10', operador: 'João Costa', saldoApos: 67 },
  ],
  6: [],
  7: [
    { id: 10, tipo: 'entrada', qtd: 48, motivo: 'Compra fornecedor', data: '2026-03-05', operador: 'Maria Silva', saldoApos: 48 },
    { id: 11, tipo: 'saida', qtd: 4, motivo: 'Venda pedido #1038', data: '2026-03-20', operador: 'Maria Silva', saldoApos: 44 },
  ],
  8: [
    { id: 12, tipo: 'entrada', qtd: 15, motivo: 'Compra fornecedor', data: '2026-03-08', operador: 'João Costa', saldoApos: 15 },
    { id: 13, tipo: 'saida', qtd: 4, motivo: 'Venda pedido #1039', data: '2026-03-25', operador: 'Maria Silva', saldoApos: 11 },
  ],
}
