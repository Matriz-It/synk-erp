'use client'

import { useState, useMemo, useCallback, useEffect, useTransition } from 'react'
import { ArrowDownRight, ArrowUpRight, Download, Loader2, Search, TrendingUp, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getCashflowAction, type CashflowResponse, type LancamentoCaixa } from '@/app/actions/cashflow'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
}

function withSaldo(list: LancamentoCaixa[], saldoInicial: number) {
  let saldo = saldoInicial
  return list.map(l => {
    saldo = l.tipo === 'entrada' ? saldo + l.valor : saldo - l.valor
    return { ...l, saldoApos: saldo }
  })
}

// ─── Gráfico semanal ──────────────────────────────────────────────────────────

function GraficoSemanal({ items }: { items: LancamentoCaixa[] }) {
  const semanas = ['S1','S2','S3','S4','S5']
  const dados = semanas.map((s, i) => {
    const ini = i * 7 + 1
    const fim = ini + 6
    const w = items.filter(l => {
      const dia = parseInt(l.data.split('-')[2])
      return dia >= ini && dia <= fim
    })
    return {
      s,
      entradas: w.filter(l => l.tipo === 'entrada').reduce((a, l) => a + l.valor, 0),
      saidas:   w.filter(l => l.tipo === 'saida').reduce((a, l) => a + l.valor, 0),
    }
  })

  const maxVal = Math.max(...dados.flatMap(d => [d.entradas, d.saidas]), 1)
  const H = 160
  const barW = 18
  const gap = 4
  const groupW = barW * 2 + gap
  const colW = 64

  return (
    <div className="overflow-x-auto">
      <svg width={semanas.length * colW + 32} height={H + 40} className="block">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = H - pct * H
          return (
            <g key={pct}>
              <line x1={16} y1={y} x2={semanas.length * colW + 16} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth={1} />
              <text x={14} y={y + 4} textAnchor="end" fontSize={10} fill="#94A3B8">{Math.round(maxVal * pct / 1000)}k</text>
            </g>
          )
        })}
        {dados.map((d, i) => {
          const x = 24 + i * colW + (colW - groupW) / 2
          const hE = d.entradas > 0 ? Math.max((d.entradas / maxVal) * H, 4) : 0
          const hS = d.saidas   > 0 ? Math.max((d.saidas   / maxVal) * H, 4) : 0
          return (
            <g key={d.s}>
              <rect x={x}             y={H - hE} width={barW} height={hE} rx={3} fill="#3D3EBF" opacity={0.9} />
              <rect x={x + barW + gap} y={H - hS} width={barW} height={hS} rx={3} fill="#3D3EBF" opacity={0.45} />
              <text x={x + groupW / 2} y={H + 16} textAnchor="middle" fontSize={11} fill="#64748B">{d.s}</text>
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex items-center gap-4 px-4 text-[12px] text-[#64748B]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ background: '#3D3EBF', opacity: 0.9 }} />Entradas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ background: '#3D3EBF', opacity: 0.45 }} />Saídas
        </span>
      </div>
    </div>
  )
}

// ─── View principal ───────────────────────────────────────────────────────────

export function FluxoView({ initialData }: { initialData: CashflowResponse }) {
  const [data, setData] = useState<CashflowResponse>(initialData)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<'all' | 'entrada' | 'saida'>('all')
  const [mesFilter, setMesFilter] = useState(() => new Date().toISOString().slice(0, 7))
  const [isPending, startTransition] = useTransition()

  const refetch = useCallback((mes: string, tipo: string, sq: string) => {
    startTransition(async () => {
      const result = await getCashflowAction({
        mes,
        tipo: tipo !== 'all' ? tipo : undefined,
        search: sq || undefined,
      })
      setData(result)
    })
  }, [])

  // Rebusca ao mudar mês
  const handleMesChange = (mes: string) => {
    setMesFilter(mes)
    refetch(mes, tipoFilter, search)
  }

  // Rebusca ao mudar tipo
  const handleTipoChange = (tipo: 'all' | 'entrada' | 'saida') => {
    setTipoFilter(tipo)
    refetch(mesFilter, tipo, search)
  }

  // Rebusca ao mudar busca (com debounce simples)
  useEffect(() => {
    const t = setTimeout(() => refetch(mesFilter, tipoFilter, search), 350)
    return () => clearTimeout(t)
  }, [search, mesFilter, tipoFilter, refetch])

  const { saldoInicial, totais, lancamentos } = data
  const comSaldo = useMemo(() => withSaldo(lancamentos, saldoInicial), [lancamentos, saldoInicial])

  const mesSelecionado = new Date(mesFilter + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">Fluxo de Caixa</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">Movimentações de {mesSelecionado}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={mesFilter}
            onChange={e => handleMesChange(e.target.value)}
            className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
          />
          <Button variant="outline" className="h-9 gap-1.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-synk-navy hover:bg-[#F1F5F9]">
            <Download className="size-3.5" strokeWidth={1.5} />Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Entradas no mês"  value={formatBRL(totais.entradas)}  color="#14b87e" bg="#d1fae5" icon="up" />
        <KpiCard label="Saídas no mês"    value={formatBRL(totais.saidas)}    color="#ef4444" bg="#fee2e2" icon="down" />
        <KpiCard label="Resultado do mês" value={formatBRL(totais.saldo)}     color={totais.saldo >= 0 ? '#3d3ebf' : '#ef4444'} bg={totais.saldo >= 0 ? '#eef0ff' : '#fee2e2'} />
        <KpiCard label="Saldo atual"      value={formatBRL(totais.saldoAtual)} color="#0f172a" bg="#fff" icon="wallet" />
      </div>

      {/* Gráfico */}
      <section className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-synk-navy">Comparativo semanal</h2>
            <p className="text-[13px] text-[#64748B]">Entradas e saídas por semana</p>
          </div>
          <div className="text-right text-[13px]">
            <p className="text-[#94A3B8]">Saldo inicial do mês</p>
            <p className="font-mono font-semibold text-synk-navy">{formatBRL(saldoInicial)}</p>
          </div>
        </div>
        <GraficoSemanal items={lancamentos} />
      </section>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input placeholder="Buscar por descrição, origem ou categoria..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="size-4 animate-spin text-[#94A3B8]" strokeWidth={1.5} />}
          {(['all', 'entrada', 'saida'] as const).map(t => (
            <button key={t} type="button" onClick={() => handleTipoChange(t)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${tipoFilter === t ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'}`}>
              {t === 'all' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#94A3B8]">
            <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
            <span className="text-[14px]">Carregando lançamentos...</span>
          </div>
        ) : comSaldo.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <TrendingUp className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhum lançamento encontrado</p>
            <p className="text-[13px] text-[#94A3B8]">Baixe contas a pagar ou a receber para movimentar o caixa</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Saldo'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${[4, 5].includes(i) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comSaldo.map((l, i) => (
                  <tr key={l.id} className={`transition-colors hover:bg-[#F8F9FC] ${i < comSaldo.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-[#64748B]">{formatDate(l.data)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-synk-navy">{l.descricao}</p>
                      <p className="text-[11px] text-[#94A3B8]">{l.origem}</p>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{l.categoria}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${l.tipo === 'entrada' ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#fee2e2] text-[#ef4444]'}`}>
                        {l.tipo === 'entrada'
                          ? <ArrowDownRight className="size-3" strokeWidth={2} />
                          : <ArrowUpRight   className="size-3" strokeWidth={2} />}
                        {l.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] font-semibold ${l.tipo === 'entrada' ? 'text-[#14b87e]' : 'text-[#ef4444]'}`}>
                      {l.tipo === 'entrada' ? '+' : '−'}{formatBRL(l.valor)}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] font-bold ${l.saldoApos >= 0 ? 'text-synk-navy' : 'text-[#ef4444]'}`}>
                      {formatBRL(l.saldoApos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isPending && comSaldo.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[12px] text-[#94A3B8]">
            <span>{comSaldo.length} lançamento{comSaldo.length !== 1 ? 's' : ''}</span>
            <span>Saldo final: <span className="font-mono font-semibold text-synk-navy">{formatBRL(comSaldo[comSaldo.length - 1]?.saldoApos ?? saldoInicial)}</span></span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function KpiCard({ label, value, color, bg, icon }: {
  label: string; value: string; color: string; bg: string; icon?: 'up' | 'down' | 'wallet'
}) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ background: bg }}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
        {icon && (
          <span className="flex size-7 items-center justify-center rounded-md" style={{ background: `${color}20` }}>
            {icon === 'up'     && <ArrowDownRight className="size-3.5" style={{ color }} strokeWidth={2} />}
            {icon === 'down'   && <ArrowUpRight   className="size-3.5" style={{ color }} strokeWidth={2} />}
            {icon === 'wallet' && <Wallet         className="size-3.5" style={{ color }} strokeWidth={1.5} />}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[22px] font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
