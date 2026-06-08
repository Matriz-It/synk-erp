'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Plus, Search, Settings, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModalContaForm } from './modal-conta-form'
import { ModalBaixa } from './modal-baixa'
import { ContaStatusBadge } from './conta-status-badge'
import {
  type Conta, type ContaStatus,
  formatBRL, formatDate,
} from './types'

export interface ContasViewActions {
  create: (dto: Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>) => Promise<Conta>
  update: (id: string, dto: Partial<Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>>) => Promise<Conta>
  pay:    (id: string, pagoEm: string, valorPago?: number) => Promise<Conta>
  remove: (id: string) => Promise<void>
}

export interface ContasViewConfig {
  title: string
  parceiroLabel: string
  baixaLabel: string
  baixaModalTitle: string
  novoLabel: string
  categorias: readonly { value: string; label: string }[]
  initialData: Conta[]
  actions?: ContasViewActions
}

const STATUS_FILTROS: { key: 'all' | ContaStatus; label: string }[] = [
  { key: 'all',      label: 'Todas'      },
  { key: 'aberto',   label: 'Em aberto'  },
  { key: 'vencendo', label: 'Vencendo'   },
  { key: 'vencido',  label: 'Vencido'    },
  { key: 'pago',     label: 'Pago'       },
]

export function ContasView({ config }: { config: ContasViewConfig }) {
  const act = config.actions
  const [contas, setContas] = useState<Conta[]>(config.initialData)
  const [search, setSearch] = useState('')
  const [statusFilt, setStatusFilt] = useState<'all' | ContaStatus>('all')

  const [modalForm, setModalForm] = useState(false)
  const [contaEdicao, setContaEdicao] = useState<Conta | null>(null)
  const [modalBaixa, setModalBaixa] = useState(false)
  const [contaBaixa, setContaBaixa] = useState<Conta | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contas.filter(c => {
      const ms = !q || c.parceiro.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q) || String(c.numero).includes(q)
      const mst = statusFilt === 'all' || c.status === statusFilt
      return ms && mst
    }).sort((a, b) => {
      // Vencidos e vencendo primeiro, depois aberto, depois pago
      const order: Record<ContaStatus, number> = { vencido: 0, vencendo: 1, aberto: 2, pago: 3 }
      return order[a.status] - order[b.status] || a.vencimento.localeCompare(b.vencimento)
    })
  }, [contas, search, statusFilt])

  const kpis = useMemo(() => {
    const pendentes = contas.filter(c => c.status !== 'pago')
    return {
      total:    pendentes.reduce((a, c) => a + c.valor, 0),
      vencido:  contas.filter(c => c.status === 'vencido').reduce((a, c) => a + c.valor, 0),
      vencendo: contas.filter(c => c.status === 'vencendo').reduce((a, c) => a + c.valor, 0),
      pago:     contas.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor, 0),
    }
  }, [contas])

  const totalFiltrado = filtered.filter(c => c.status !== 'pago').reduce((a, c) => a + c.valor, 0)

  function openEditar(c: Conta) { setContaEdicao(c); setModalForm(true) }
  function openBaixa(c: Conta)  { setContaBaixa(c);  setModalBaixa(true) }

  async function handleSave(data: Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>) {
    if (contaEdicao) {
      const optimistic = { ...contaEdicao, ...data }
      setContas(cs => cs.map(c => c.id === contaEdicao.id ? optimistic : c))
      try {
        const updated = act ? await act.update(contaEdicao.id, data) : optimistic
        setContas(cs => cs.map(c => c.id === contaEdicao.id ? updated : c))
        toast.success('Conta atualizada')
      } catch (err) {
        setContas(cs => cs.map(c => c.id === contaEdicao.id ? contaEdicao : c))
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar')
        throw err
      }
    } else {
      const tempId = `temp-${Date.now()}`
      const temp: Conta = { ...data, id: tempId, numero: Math.max(0, ...contas.map(c => c.numero)) + 1, status: 'aberto', criadoEm: new Date().toISOString().split('T')[0] }
      setContas(cs => [temp, ...cs])
      try {
        const created = act ? await act.create(data) : temp
        setContas(cs => cs.map(c => c.id === tempId ? created : c))
        toast.success('Conta cadastrada')
      } catch (err) {
        setContas(cs => cs.filter(c => c.id !== tempId))
        toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar')
        throw err
      }
    }
    setContaEdicao(null)
  }

  async function handleBaixa(id: string, pagoEm: string, valorPago: number) {
    const backup = contas.find(c => c.id === id)
    setContas(cs => cs.map(c => c.id === id ? { ...c, status: 'pago' as const, pagoEm } : c))
    try {
      const updated = act ? await act.pay(id, pagoEm, valorPago) : null
      if (updated) setContas(cs => cs.map(c => c.id === id ? updated : c))
      toast.success('Baixa registrada')
    } catch (err) {
      if (backup) setContas(cs => cs.map(c => c.id === id ? backup : c))
      toast.error('Erro ao registrar baixa')
    }
    setContaBaixa(null)
  }

  async function handleExcluir(c: Conta) {
    setContas(cs => cs.filter(x => x.id !== c.id))
    try {
      if (act) await act.remove(c.id)
      toast.success('Conta excluída')
    } catch {
      setContas(cs => [c, ...cs])
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">{config.title}</h1>
          <p className="text-sm text-[#64748B]">
            {contas.filter(c => c.status !== 'pago').length} pendente{contas.filter(c => c.status !== 'pago').length !== 1 ? 's' : ''} · {contas.filter(c => c.status === 'vencido').length} vencido{contas.filter(c => c.status === 'vencido').length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setContaEdicao(null); setModalForm(true) }} className="bg-synk-indigo hover:bg-synk-indigo-hover">
          <Plus className="size-4" strokeWidth={2} />{config.novoLabel}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total pendente"   value={formatBRL(kpis.total)}    color="#0f172a" bg="#fff" />
        <KpiCard label="Vencido"          value={formatBRL(kpis.vencido)}  color="#ef4444" bg="#fee2e2" />
        <KpiCard label="Vencendo (7 dias)"value={formatBRL(kpis.vencendo)} color="#f59e0b" bg="#fef3c7" />
        <KpiCard label="Pago no período"  value={formatBRL(kpis.pago)}     color="#14b87e" bg="#d1fae5" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input placeholder={`Buscar por ${config.parceiroLabel.toLowerCase()}, descrição ou número...`} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTROS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setStatusFilt(key)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${statusFilt === key ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <User className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhuma conta encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {['#', config.parceiroLabel, 'Descrição', 'Valor', 'Vencimento', 'Status', 'Ações'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 3 ? 'text-right' : i === 6 ? 'text-right' : i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-synk-indigo">#{c.numero}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-synk-navy">{c.parceiro}</p>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{c.descricao}</td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] font-bold text-synk-navy">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[13px] ${c.status === 'vencido' ? 'font-semibold text-[#ef4444]' : c.status === 'vencendo' ? 'font-semibold text-[#f59e0b]' : 'text-[#64748B]'}`}>
                        {formatDate(c.vencimento)}
                      </span>
                      {c.status === 'pago' && c.pagoEm && (
                        <p className="text-[11px] text-[#94A3B8]">Pago em {formatDate(c.pagoEm)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center"><ContaStatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {c.status !== 'pago' && (
                          <button type="button" onClick={() => openBaixa(c)}
                            className="flex h-7 items-center gap-1 rounded-md bg-[#d1fae5] px-2.5 text-[11px] font-semibold text-[#14b87e] transition-colors hover:bg-[#14b87e] hover:text-white">
                            <CheckCircle className="size-3" strokeWidth={1.5} />Baixar
                          </button>
                        )}
                        <button type="button" onClick={() => openEditar(c)}
                          className="flex size-7 items-center justify-center rounded-md border border-[#E2E8F0] text-[#94A3B8] transition-colors hover:border-synk-indigo hover:bg-synk-indigo-light hover:text-synk-indigo"
                          aria-label="Editar">
                          <Settings className="size-3.5" strokeWidth={1.5} />
                        </button>
                        <button type="button" onClick={() => handleExcluir(c)}
                          className="flex size-7 items-center justify-center rounded-md border border-[#E2E8F0] text-[#94A3B8] transition-colors hover:border-synk-danger hover:bg-[#fee2e2] hover:text-synk-danger"
                          aria-label="Excluir">
                          <Trash2 className="size-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[12px] text-[#94A3B8]">
            <span>Mostrando {filtered.length} de {contas.length} contas</span>
            <span>Total pendente (filtrado): <span className="font-mono font-semibold text-synk-navy">{formatBRL(totalFiltrado)}</span></span>
          </div>
        )}
      </div>

      <ModalContaForm
        open={modalForm}
        onClose={() => { setModalForm(false); setContaEdicao(null) }}
        onSave={handleSave}
        conta={contaEdicao}
        parceiroLabel={config.parceiroLabel}
        categorias={config.categorias}
      />
      <ModalBaixa
        open={modalBaixa}
        onClose={() => setModalBaixa(false)}
        conta={contaBaixa}
        onConfirm={handleBaixa}
        titulo={config.baixaModalTitle}
      />
    </div>
  )
}

function KpiCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ background: bg }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-1 font-display text-[22px] font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
