'use client'

import { useState, useMemo } from 'react'
import { ArrowRight, Loader2, Plus, Search, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ModalDetalhePedido } from './modal-detalhe'
import { NovoPedido } from './novo-pedido'
import { StatusBadge } from './status-badge'
import { toast } from 'sonner'
import { createOrderAction, getOrderAction, updateOrderFullAction, type OrderDetail } from '@/app/actions/orders'

export interface OrderViewActions {
  create: (data: { clientId: string; status: StatusPedido; obs: string; descontoGlobal: number; items: PedidoItem[] }) => Promise<Pedido>
  updateFull: (id: string, data: { status: StatusPedido; obs: string; descontoGlobal: number; items: PedidoItem[] }) => Promise<Pedido>
  getDetail: (id: string) => Promise<OrderDetail>
  convertToOrder?: (id: string) => Promise<Pedido>
}

const DEFAULT_ACTIONS: OrderViewActions = {
  create: createOrderAction,
  updateFull: updateOrderFullAction,
  getDetail: getOrderAction,
}
import type { Cliente } from '@/components/clients/types'
import type { Produto } from '@/components/products/types'
import {
  type Pedido, type PedidoItem, type StatusPedido,
  formatBRL, formatDate,
} from './types'

export interface OrderViewConfig {
  title: string
  entity: string
  entityPlural: string
  entityCapital: string
  novoLabel: string
  confirmarLabel: string
  allowedStatuses?: StatusPedido[]   // undefined = todos
  editableStatuses?: StatusPedido[]  // status que abrem o form de edição ao clicar na linha
}

const DEFAULT_CONFIG: OrderViewConfig = {
  title: 'Pedidos de Venda',
  entity: 'pedido',
  entityPlural: 'pedidos',
  entityCapital: 'Pedido',
  novoLabel: 'Novo pedido',
  confirmarLabel: 'Confirmar pedido',
}

const ALL_STATUS_FILTROS: { key: StatusPedido; label: string }[] = [
  { key: 'rascunho',     label: 'Rascunho'     },
  { key: 'pendente',     label: 'Pendente'     },
  { key: 'aprovado',     label: 'Aprovado'     },
  { key: 'cancelado',    label: 'Cancelado'    },
  { key: 'em_andamento', label: 'Em andamento' },
  { key: 'entregue',     label: 'Entregue'     },
  { key: 'concluido',    label: 'Concluído'    },
]

export function PedidosView({
  initialPedidos,
  clientes,
  produtos,
  config: cfg = DEFAULT_CONFIG,
  actions: act = DEFAULT_ACTIONS,
}: {
  initialPedidos: Pedido[]
  clientes: Cliente[]
  produtos: Produto[]
  config?: OrderViewConfig
  actions?: OrderViewActions
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos)
  const [view, setView] = useState<'list' | 'novo'>('list')
  const [search, setSearch] = useState('')
  const [statusFilt, setStatusFilt] = useState<'all' | StatusPedido>('all')
  const [pedidoDetalhe, setPedidoDetalhe] = useState<Pedido | null>(null)
  const [editingOrder, setEditingOrder] = useState<OrderDetail | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const filtrados = useMemo(() => {
    const q = search.toLowerCase()
    return pedidos.filter((p) => {
      const ms = !q || p.cliente.toLowerCase().includes(q) || String(p.numero).includes(q)
      const mst = statusFilt === 'all' || p.status === statusFilt
      return ms && mst
    })
  }, [pedidos, search, statusFilt])

  const kpis = useMemo(() => ({
    total: pedidos.length,
    aprovados: pedidos.filter((p) => p.status === 'aprovado').length,
    faturado: pedidos.filter((p) => p.status === 'aprovado').reduce((a, p) => a + p.total, 0),
    pendente: pedidos.filter((p) => p.status === 'pendente').reduce((a, p) => a + p.total, 0),
  }), [pedidos])

  const statusFiltros = [
    { key: 'all' as const, label: 'Todos' },
    ...ALL_STATUS_FILTROS.filter((s) => !cfg.allowedStatuses || cfg.allowedStatuses.includes(s.key)),
  ]

  const proximoNumero = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.numero)) + 1 : 1000
  const totalFiltrado = filtrados.reduce((a, p) => a + p.total, 0)

  async function handleSalvar(data: {
    clientId: string; status: StatusPedido; obs: string
    descontoGlobal: number; formaPagamento: string; dataPagamento: string; items: PedidoItem[]
  }) {
    try {
      if (editingOrder) {
        const updated = await act.updateFull(editingOrder.id, data)
        setPedidos((ps) => ps.map((p) => p.id === updated.id ? updated : p))
      } else {
        const created = await act.create(data)
        setPedidos((ps) => [created, ...ps])
      }
      setView('list')
      setEditingOrder(null)
      toast.success(data.status === 'rascunho' ? 'Rascunho salvo' : `${cfg.entityCapital} confirmado!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    }
  }

  async function handleRowClick(p: Pedido) {
    if (cfg.editableStatuses?.includes(p.status)) {
      setLoadingEdit(true)
      try {
        const detail = await act.getDetail(p.id)
        setEditingOrder(detail)
        setView('novo')
      } catch {
        toast.error(`Erro ao carregar ${cfg.entity}`)
      } finally {
        setLoadingEdit(false)
      }
    } else {
      setPedidoDetalhe(p)
    }
  }

  if (view === 'novo') {
    return (
      <NovoPedido
        onVoltar={() => { setView('list'); setEditingOrder(null) }}
        onSalvar={handleSalvar}
        proximoNumero={proximoNumero}
        clientes={clientes}
        produtos={produtos}
        config={cfg}
        initialOrder={editingOrder ?? undefined}
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">{cfg.title}</h1>
          <p className="text-sm text-[#64748B]">
            {pedidos.length} {pedidos.length !== 1 ? cfg.entityPlural : cfg.entity} · {kpis.aprovados} aprovado{kpis.aprovados !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setView('novo')} className="bg-synk-indigo hover:bg-synk-indigo-hover">
          <Plus className="size-4" strokeWidth={2.5} />{cfg.novoLabel}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label={`Total de ${cfg.entityPlural}`} value={kpis.total} />
        <KpiCard label="Aprovados" value={kpis.aprovados} color="#14b87e" bg="#d1fae5" />
        <KpiCard label="Faturado (mês)" value={formatBRL(kpis.faturado)} color="#3d3ebf" bg="#eef0ff" />
        <KpiCard label="Aguardando aprov." value={formatBRL(kpis.pendente)} color="#f59e0b" bg="#fef3c7" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input placeholder={`Buscar por cliente ou nº do ${cfg.entity}...`}value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFiltros.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilt(key)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                statusFilt === key
                  ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingCart className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhum {cfg.entity} encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {[cfg.entityCapital, 'Cliente', 'Itens', 'Subtotal', 'Desconto', 'Total', 'Status', 'Data', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${[2, 3, 4, 5].includes(i) ? 'text-right' : i === 6 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => handleRowClick(p)}
                    className={`cursor-pointer transition-colors hover:bg-[#F8F9FC] ${i < filtrados.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-synk-indigo">#{p.numero}</td>
                    <td className="px-4 py-3 font-medium text-synk-navy">{p.cliente}</td>
                    <td className="px-4 py-3 text-right text-[#64748B]">{p.itens}</td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] text-[#64748B]">{formatBRL(p.subtotal)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-[13px] ${p.desconto > 0 ? 'text-[#ef4444]' : 'text-[#94A3B8]'}`}>
                      {p.desconto > 0 ? `-${formatBRL(p.desconto)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] font-bold text-synk-navy">{formatBRL(p.total)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#94A3B8]">{formatDate(p.criadoEm)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => handleRowClick(p)} disabled={loadingEdit} className="flex items-center gap-1 text-[12px] font-medium text-synk-indigo hover:text-synk-indigo-hover disabled:opacity-50">
                        {loadingEdit && cfg.editableStatuses?.includes(p.status)
                          ? <Loader2 className="size-3 animate-spin" />
                          : <><span>Ver</span><ArrowRight className="size-3" strokeWidth={1.5} /></>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtrados.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[12px] text-[#94A3B8]">
            <span>Mostrando {filtrados.length} de {pedidos.length} {filtrados.length !== 1 ? cfg.entityPlural : cfg.entity}</span>
            <span>Total: <span className="font-mono font-semibold text-synk-navy">{formatBRL(totalFiltrado)}</span></span>
          </div>
        )}
      </div>

      <ModalDetalhePedido
        pedido={pedidoDetalhe}
        onClose={() => setPedidoDetalhe(null)}
        onNovoPedido={() => setView('novo')}
        onConvertToOrder={act.convertToOrder ? async () => {
          if (!pedidoDetalhe || !act.convertToOrder) return
          try {
            const order = await act.convertToOrder(pedidoDetalhe.id)
            setPedidos((ps) => ps.filter((p) => p.id !== pedidoDetalhe.id))
            setPedidoDetalhe(null)
            toast.success(`Pedido #${order.numero} criado com sucesso!`)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao converter')
          }
        } : undefined}
      />
    </div>
  )
}

function KpiCard({ label, value, color, bg }: { label: string; value: string | number; color?: string; bg?: string }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ background: bg ?? '#fff' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold" style={{ color: color ?? '#0f172a' }}>{value}</p>
    </div>
  )
}
