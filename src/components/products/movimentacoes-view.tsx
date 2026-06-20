'use client'

import { useMemo, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Search, TrendingDown, TrendingUp, Activity } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fmtDate } from '@/lib/utils'
import type { MovimentacaoGlobal, Produto } from './types'

interface Props {
  initialMovimentacoes: MovimentacaoGlobal[]
  produtos: Produto[]
}

export function MovimentacoesView({ initialMovimentacoes, produtos }: Props) {
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<'all' | 'entrada' | 'saida'>('all')
  const [productFilter, setProductFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return initialMovimentacoes.filter((m) => {
      const matchSearch =
        !q ||
        m.produto.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.motivo.toLowerCase().includes(q) ||
        m.operador.toLowerCase().includes(q)
      const matchTipo = tipoFilter === 'all' || m.tipo === tipoFilter
      const matchProduct = productFilter === 'all' || m.productId === productFilter
      return matchSearch && matchTipo && matchProduct
    })
  }, [initialMovimentacoes, search, tipoFilter, productFilter])

  const kpis = useMemo(() => {
    const entradas = initialMovimentacoes.filter((m) => m.tipo === 'entrada')
    const saidas   = initialMovimentacoes.filter((m) => m.tipo === 'saida')
    return {
      total:       initialMovimentacoes.length,
      entradas:    entradas.length,
      qtdEntrada:  entradas.reduce((s, m) => s + m.qtd, 0),
      saidas:      saidas.length,
      qtdSaida:    saidas.reduce((s, m) => s + m.qtd, 0),
    }
  }, [initialMovimentacoes])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-synk-navy">Movimentações de Estoque</h1>
        <p className="text-sm text-[#64748B]">
          {initialMovimentacoes.length} registro{initialMovimentacoes.length !== 1 ? 's' : ''} no total
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Total"
          value={kpis.total}
          sub="movimentações"
          icon={<Activity className="size-4 text-[#94A3B8]" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Entradas"
          value={kpis.entradas}
          sub={`${kpis.qtdEntrada} unidades`}
          color="#14b87e"
          bg="#d1fae5"
          icon={<ArrowUpCircle className="size-4 text-[#14b87e]" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Saídas"
          value={kpis.saidas}
          sub={`${kpis.qtdSaida} unidades`}
          color="#ef4444"
          bg="#fee2e2"
          icon={<ArrowDownCircle className="size-4 text-[#ef4444]" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Saldo líquido"
          value={kpis.qtdEntrada - kpis.qtdSaida}
          sub="unidades"
          color={kpis.qtdEntrada >= kpis.qtdSaida ? '#14b87e' : '#ef4444'}
          bg={kpis.qtdEntrada >= kpis.qtdSaida ? '#d1fae5' : '#fee2e2'}
          icon={kpis.qtdEntrada >= kpis.qtdSaida
            ? <TrendingUp className="size-4 text-[#14b87e]" strokeWidth={1.5} />
            : <TrendingDown className="size-4 text-[#ef4444]" strokeWidth={1.5} />}
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input
            placeholder="Buscar por produto, SKU, motivo ou operador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>

        {/* Tipo pills */}
        <div className="flex gap-2">
          {(['all', 'entrada', 'saida'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipoFilter(t)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                tipoFilter === t
                  ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'
              }`}
            >
              {t === 'all' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>

        {/* Produto select */}
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
        >
          <option value="all">Todos os produtos</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Activity className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhuma movimentação encontrada</p>
            <p className="text-[13px] text-[#94A3B8]">Tente ajustar os filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {['Produto', 'Tipo', 'Qtd', 'Motivo', 'Operador', 'Saldo após', 'Data'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${
                        i === 2 || i === 5 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                  >
                    {/* Produto */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-synk-navy">{m.produto}</p>
                      <p className="font-mono text-[11px] text-synk-indigo">{m.sku}</p>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 text-[11px] font-bold ${
                        m.tipo === 'entrada'
                          ? 'bg-[#d1fae5] text-[#14b87e]'
                          : 'bg-[#fee2e2] text-[#ef4444]'
                      }`}>
                        {m.tipo === 'entrada'
                          ? <ArrowUpCircle className="size-3" strokeWidth={2} />
                          : <ArrowDownCircle className="size-3" strokeWidth={2} />}
                        {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>

                    {/* Qtd */}
                    <td className="px-4 py-3 text-right">
                      <span className={`font-display text-[15px] font-bold ${
                        m.tipo === 'entrada' ? 'text-[#14b87e]' : 'text-[#ef4444]'
                      }`}>
                        {m.tipo === 'entrada' ? '+' : '−'}{m.qtd}
                      </span>
                    </td>

                    {/* Motivo */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="truncate text-[13px] text-[#374151]">{m.motivo}</p>
                    </td>

                    {/* Operador */}
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{m.operador}</td>

                    {/* Saldo após */}
                    <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold text-synk-navy">
                      {m.saldoApos}
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{fmtDate(m.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[12px] text-[#94A3B8]">
            <span>
              Mostrando {filtered.length} de {initialMovimentacoes.length} movimentações
            </span>
            <span>
              {filtered.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + m.qtd, 0)} un. entradas ·{' '}
              {filtered.filter((m) => m.tipo === 'saida').reduce((s, m) => s + m.qtd, 0)} un. saídas
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label, value, sub, color, bg, icon,
}: {
  label: string
  value: number
  sub: string
  color?: string
  bg?: string
  icon: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg border border-[#E2E8F0] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      style={{ background: bg ?? '#fff' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-2xl font-bold" style={{ color: color ?? '#0f172a' }}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-[#94A3B8]">{sub}</p>
    </div>
  )
}
