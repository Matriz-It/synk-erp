'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { ArrowUpDown, Plus, Search, Settings, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createServiceAction, updateServiceAction } from '@/app/actions/services'
import { ModalFormServico } from './modal-form'
import { type Servico, formatBRL } from './types'

type SortKey = 'nome' | 'preco'
type StatusFilter = 'all' | 'ativo' | 'inativo'

export function ServicosView({ initialServicos }: { initialServicos: Servico[] }) {
  const [servicos, setServicos] = useState<Servico[]>(initialServicos)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [modalForm, setModalForm] = useState(false)
  const [servicoEdicao, setServicoEdicao] = useState<Servico | null>(null)

  const filtered = useMemo(() => {
    let list = [...servicos]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.nome.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q))
    }
    if (statusFilter === 'ativo') list = list.filter((s) => s.ativo)
    else if (statusFilter === 'inativo') list = list.filter((s) => !s.ativo)

    list.sort((a, b) => {
      const d = sortBy === 'nome' ? a.nome.localeCompare(b.nome) : a.preco - b.preco
      return sortDir === 'asc' ? d : -d
    })
    return list
  }, [servicos, search, statusFilter, sortBy, sortDir])

  const kpis = useMemo(() => ({
    total: servicos.length,
    ativos: servicos.filter((s) => s.ativo).length,
    inativos: servicos.filter((s) => !s.ativo).length,
    precoMedio: servicos.length > 0 ? servicos.reduce((acc, s) => acc + s.preco, 0) / servicos.length : 0,
  }), [servicos])

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(key); setSortDir('asc') }
  }

  function openEditar(s: Servico) {
    setServicoEdicao(s)
    setModalForm(true)
  }

  async function handleSave(data: Omit<Servico, 'id' | 'criadoEm'>): Promise<Servico> {
    if (servicoEdicao) {
      const optimistic = { ...servicoEdicao, ...data }
      setServicos((ss) => ss.map((s) => s.id === servicoEdicao.id ? optimistic : s))
      try {
        const updated = await updateServiceAction(servicoEdicao.id, {
          codigo: data.codigo, nome: data.nome, descricao: data.descricao ?? undefined,
          preco: data.preco, precoCusto: data.precoCusto, ativo: data.ativo,
        })
        setServicos((ss) => ss.map((s) => s.id === servicoEdicao.id ? updated : s))
        toast.success('Serviço atualizado')
        setServicoEdicao(null)
        return updated
      } catch (err) {
        setServicos((ss) => ss.map((s) => s.id === servicoEdicao.id ? servicoEdicao : s))
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar serviço')
        throw err
      }
    } else {
      const tempId = `temp-${Date.now()}`
      const temp: Servico = { ...data, id: tempId, criadoEm: new Date().toISOString().split('T')[0] }
      setServicos((ss) => [...ss, temp])
      try {
        const created = await createServiceAction({
          codigo: data.codigo, nome: data.nome, descricao: data.descricao ?? undefined,
          preco: data.preco, precoCusto: data.precoCusto, ativo: data.ativo,
        })
        setServicos((ss) => ss.map((s) => s.id === tempId ? created : s))
        toast.success('Serviço cadastrado')
        return created
      } catch (err) {
        setServicos((ss) => ss.filter((s) => s.id !== tempId))
        toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar serviço')
        throw err
      }
    }
  }

  const existingCodigos = servicos.map((s) => s.codigo)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">Serviços</h1>
          <p className="text-sm text-[#64748B]">Gerencie o catálogo de serviços oferecidos</p>
        </div>
        <Button
          onClick={() => { setServicoEdicao(null); setModalForm(true) }}
          className="bg-synk-indigo hover:bg-synk-indigo-hover"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Novo serviço
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total de serviços" value={kpis.total} />
        <KpiCard label="Serviços ativos" value={kpis.ativos} color="#14b87e" bg="#d1fae5" />
        <KpiCard label="Inativos" value={kpis.inativos} color="#94a3b8" bg="#f1f5f9" />
        <KpiCard label="Preço médio" value={formatBRL(kpis.precoMedio)} color="#3d3ebf" bg="#eef0ff" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input placeholder="Buscar por nome ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [k, d] = e.target.value.split('-') as [SortKey, 'asc' | 'desc']; setSortBy(k); setSortDir(d) }} className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
            <option value="nome-asc">Nome A→Z</option>
            <option value="nome-desc">Nome Z→A</option>
            <option value="preco-asc">Menor preço</option>
            <option value="preco-desc">Maior preço</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Wrench className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#64748B]">Nenhum serviço encontrado</p>
            <p className="text-xs text-[#94A3B8]">Tente ajustar os filtros ou cadastre um novo serviço</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  <th className="w-12 px-4 py-3" />
                  <SortTh label="Nome" k="nome" current={sortBy} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Código</th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] sm:table-cell">Descrição</th>
                  <SortTh label="Preço" k="preco" current={sortBy} dir={sortDir} onSort={toggleSort} right />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} onClick={() => openEditar(s)} className={`cursor-pointer transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-[#F1F5F9]">
                        <Wrench className="size-4 text-[#94A3B8]" strokeWidth={1.5} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-synk-navy">{s.nome}</td>
                    <td className="px-4 py-3 font-mono text-xs text-synk-indigo">{s.codigo}</td>
                    <td className="hidden max-w-[320px] truncate px-4 py-3 text-[13px] text-[#64748B] sm:table-cell">{s.descricao || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-synk-navy">{formatBRL(s.preco)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${s.ativo ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                        <span className={`size-1.5 rounded-full ${s.ativo ? 'bg-[#14b87e]' : 'bg-[#94A3B8]'}`} />
                        {s.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => openEditar(s)} className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-synk-navy" aria-label="Editar">
                          <Settings className="size-4" strokeWidth={1.5} />
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
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[13px] text-[#64748B]">
            <span>{filtered.length} serviço{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {modalForm && (
        <ModalFormServico
          open
          onClose={() => { setModalForm(false); setServicoEdicao(null) }}
          onSave={handleSave}
          existingCodigos={existingCodigos}
          servicoEdicao={servicoEdicao}
        />
      )}
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

function SortTh({ label, k, current, onSort, right }: { label: string; k: SortKey; current: SortKey; dir: 'asc' | 'desc'; onSort: (k: SortKey) => void; right?: boolean }) {
  const active = current === k
  return (
    <th onClick={() => onSort(k)} className={`cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:text-synk-navy ${right ? 'text-right' : 'text-left'} ${active ? 'text-synk-indigo' : 'text-[#94A3B8]'}`}>
      <span className="inline-flex items-center gap-1">
        {right && active && <ArrowUpDown className="size-3" />}
        {label}
        {!right && active && <ArrowUpDown className="size-3" />}
      </span>
    </th>
  )
}
