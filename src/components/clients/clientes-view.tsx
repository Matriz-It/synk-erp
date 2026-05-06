'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Settings, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createClienteAction,
  deleteClienteAction,
  updateClienteAction,
} from '@/app/actions/clients'
import { ModalClienteForm } from './modal-form'
import { ModalClienteDetalhe } from './modal-detalhe'
import { ModalExcluirCliente } from './modal-excluir'
import { type Cliente, formatBRL } from './types'

export function ClientesView({ initialClientes }: { initialClientes: Cliente[] }) {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<'all' | 'PJ' | 'PF'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all')

  const [modalForm, setModalForm] = useState(false)
  const [clienteEdicao, setClienteEdicao] = useState<Cliente | null>(null)
  const [modalDetalhe, setModalDetalhe] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [clienteExcluir, setClienteExcluir] = useState<Cliente | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clientes.filter((c) => {
      const matchSearch = !q
        || c.razaoSocial.toLowerCase().includes(q)
        || c.documento.includes(q)
        || c.nomeFantasia.toLowerCase().includes(q)
        || c.email.toLowerCase().includes(q)
      const matchTipo = tipoFilter === 'all' || c.tipo === tipoFilter
      const matchStatus =
        statusFilter === 'all'
        || (statusFilter === 'ativo' && c.ativo)
        || (statusFilter === 'inativo' && !c.ativo)
      return matchSearch && matchTipo && matchStatus
    })
  }, [clientes, search, tipoFilter, statusFilter])

  const kpis = useMemo(() => ({
    total: clientes.length,
    ativos: clientes.filter((c) => c.ativo).length,
    pj: clientes.filter((c) => c.tipo === 'PJ').length,
    pf: clientes.filter((c) => c.tipo === 'PF').length,
    volume: clientes.reduce((acc, c) => acc + c.totalGasto, 0),
  }), [clientes])

  const volumeFiltrado = filtered.reduce((acc, c) => acc + c.totalGasto, 0)

  function openDetalhe(c: Cliente) { setClienteSelecionado(c); setModalDetalhe(true) }
  function openEditar(c: Cliente) { setClienteEdicao(c); setModalDetalhe(false); setModalForm(true) }
  function openExcluirConfirm(c: Cliente) { setClienteExcluir(c); setModalDetalhe(false); setModalExcluir(true) }

  async function handleSave(data: Omit<Cliente, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>) {
    if (clienteEdicao) {
      const optimistic = { ...clienteEdicao, ...data }
      setClientes((cs) => cs.map((c) => c.id === clienteEdicao.id ? optimistic : c))
      try {
        const updated = await updateClienteAction(clienteEdicao.id, data)
        setClientes((cs) => cs.map((c) => c.id === clienteEdicao.id ? updated : c))
        toast.success('Cliente atualizado')
      } catch (err) {
        setClientes((cs) => cs.map((c) => c.id === clienteEdicao.id ? clienteEdicao : c))
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
        throw err
      }
    } else {
      const tempId = `temp-${Date.now()}`
      const temp: Cliente = { ...data, id: tempId, criadoEm: new Date().toISOString().split('T')[0], totalPedidos: 0, totalGasto: 0 }
      setClientes((cs) => [...cs, temp])
      try {
        const created = await createClienteAction(data)
        setClientes((cs) => cs.map((c) => c.id === tempId ? created : c))
        toast.success('Cliente cadastrado')
      } catch (err) {
        setClientes((cs) => cs.filter((c) => c.id !== tempId))
        toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar cliente')
        throw err
      }
    }
    setClienteEdicao(null)
  }

  async function handleExcluir() {
    if (!clienteExcluir) return
    const backup = clienteExcluir
    setClientes((cs) => cs.filter((c) => c.id !== backup.id))
    try {
      await deleteClienteAction(backup.id)
      toast.success('Cliente excluído')
    } catch (err) {
      setClientes((cs) => [...cs, backup])
      toast.error('Erro ao excluir cliente')
      throw err
    }
    setClienteExcluir(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">Clientes</h1>
          <p className="text-sm text-[#64748B]">
            {kpis.ativos} cliente{kpis.ativos !== 1 ? 's' : ''} ativo{kpis.ativos !== 1 ? 's' : ''} · {kpis.pj} PJ · {kpis.pf} PF
          </p>
        </div>
        <Button onClick={() => { setClienteEdicao(null); setModalForm(true) }} className="bg-synk-indigo hover:bg-synk-indigo-hover">
          <Plus className="size-4" strokeWidth={2} />Novo cliente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total de clientes" value={kpis.total} />
        <KpiCard label="Ativos" value={kpis.ativos} color="#14b87e" bg="#d1fae5" />
        <KpiCard label="Pessoa Jurídica" value={kpis.pj} color="#3d3ebf" bg="#eef0ff" />
        <KpiCard label="Pessoa Física" value={kpis.pf} color="#334155" bg="#F1F5F9" />
        <KpiCard label="Volume total" value={formatBRL(kpis.volume)} color="#3d3ebf" bg="#eef0ff" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          {(['all', 'PJ', 'PF'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipoFilter(t)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${tipoFilter === t ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'}`}
            >
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ativo' | 'inativo')}
            className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <User className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhum cliente encontrado</p>
            <p className="text-[13px] text-[#94A3B8]">Tente ajustar os filtros ou cadastre um novo cliente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {['Tipo', 'Cliente', 'Documento', 'Cidade / UF', 'Contato', 'Pedidos', 'Status', 'Ações'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 0 || i === 5 || i === 6 ? 'text-center' : i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => openDetalhe(c)}
                    className={`cursor-pointer transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-[5px] px-2 py-0.5 text-[11px] font-bold ${c.tipo === 'PJ' ? 'bg-synk-indigo-light text-synk-indigo' : 'bg-[#d1fae5] text-[#14b87e]'}`}>
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-synk-navy">{c.razaoSocial}</p>
                      {c.nomeFantasia && <p className="text-[11px] text-[#94A3B8]">{c.nomeFantasia}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#64748B]">{c.documento}</td>
                    <td className="px-4 py-3 text-[#374151]">{c.cidade} / {c.uf}</td>
                    <td className="px-4 py-3">
                      {c.email && <p className="text-[12px] text-[#4b5563]">{c.email}</p>}
                      {c.telefone && <p className="font-mono text-[12px] text-[#94A3B8]">{c.telefone}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="font-display font-bold text-synk-navy">{c.totalPedidos}</p>
                      <p className="text-[11px] text-[#94A3B8]">{formatBRL(c.totalGasto)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${c.ativo ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                        <span className={`size-[5px] rounded-full ${c.ativo ? 'bg-[#14b87e]' : 'bg-[#94A3B8]'}`} />
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openEditar(c)}
                          className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-synk-indigo transition-colors hover:border-synk-indigo hover:bg-synk-indigo-light"
                        >
                          <Settings className="size-3 text-synk-indigo" strokeWidth={1.5} />Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => openExcluirConfirm(c)}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-synk-danger transition-colors hover:border-synk-danger hover:bg-[#fee2e2]"
                          aria-label="Excluir"
                        >
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
            <span>Mostrando {filtered.length} de {clientes.length} clientes</span>
            <span>Volume filtrado: <span className="font-semibold text-synk-navy">{formatBRL(volumeFiltrado)}</span></span>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalClienteForm
        open={modalForm}
        onClose={() => { setModalForm(false); setClienteEdicao(null) }}
        onSave={handleSave}
        clienteEdicao={clienteEdicao}
      />
      <ModalClienteDetalhe
        open={modalDetalhe}
        onClose={() => setModalDetalhe(false)}
        cliente={clienteSelecionado}
        onEditar={() => clienteSelecionado && openEditar(clienteSelecionado)}
        onExcluir={() => clienteSelecionado && openExcluirConfirm(clienteSelecionado)}
      />
      <ModalExcluirCliente
        open={modalExcluir}
        onClose={() => setModalExcluir(false)}
        cliente={clienteExcluir}
        onConfirm={handleExcluir}
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
