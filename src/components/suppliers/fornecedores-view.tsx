'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Settings, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createSupplierAction,
  deleteSupplierAction,
  updateSupplierAction,
  type Fornecedor,
} from '@/app/actions/suppliers'
import { ModalClienteForm } from '@/components/clients/modal-form'
import { ModalClienteDetalhe } from '@/components/clients/modal-detalhe'
import { ModalExcluirCliente } from '@/components/clients/modal-excluir'
import type { Cliente } from '@/components/clients/types'

// Fornecedor tem a mesma estrutura de Cliente
type F = Fornecedor

export function FornecedoresView({ initialFornecedores }: { initialFornecedores: F[] }) {
  const [fornecedores, setFornecedores] = useState<F[]>(initialFornecedores)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<'all' | 'PJ' | 'PF'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all')

  const [modalForm, setModalForm] = useState(false)
  const [edicao, setEdicao] = useState<F | null>(null)
  const [modalDetalhe, setModalDetalhe] = useState(false)
  const [selecionado, setSelecionado] = useState<F | null>(null)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<F | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return fornecedores.filter((f) => {
      const ms = !q || f.razaoSocial.toLowerCase().includes(q) || f.documento.includes(q) || f.nomeFantasia.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
      const mt = tipoFilter === 'all' || f.tipo === tipoFilter
      const mst = statusFilter === 'all' || (statusFilter === 'ativo' && f.ativo) || (statusFilter === 'inativo' && !f.ativo)
      return ms && mt && mst
    })
  }, [fornecedores, search, tipoFilter, statusFilter])

  const kpis = useMemo(() => ({
    total:  fornecedores.length,
    ativos: fornecedores.filter(f => f.ativo).length,
    pj:     fornecedores.filter(f => f.tipo === 'PJ').length,
    pf:     fornecedores.filter(f => f.tipo === 'PF').length,
  }), [fornecedores])

  function openEditar(f: F) { setEdicao(f); setModalDetalhe(false); setModalForm(true) }
  function openExcluir(f: F) { setParaExcluir(f); setModalDetalhe(false); setModalExcluir(true) }

  async function handleSave(data: Omit<F, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>) {
    if (edicao) {
      const optimistic = { ...edicao, ...data }
      setFornecedores(fs => fs.map(f => f.id === edicao.id ? optimistic : f))
      try {
        const updated = await updateSupplierAction(edicao.id, data)
        setFornecedores(fs => fs.map(f => f.id === edicao.id ? updated : f))
        toast.success('Fornecedor atualizado')
      } catch (err) {
        setFornecedores(fs => fs.map(f => f.id === edicao.id ? edicao : f))
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar')
        throw err
      }
    } else {
      const tempId = `temp-${Date.now()}`
      const temp: F = { ...data, id: tempId, criadoEm: new Date().toISOString().split('T')[0], totalPedidos: 0, totalGasto: 0 }
      setFornecedores(fs => [...fs, temp])
      try {
        const created = await createSupplierAction(data)
        setFornecedores(fs => fs.map(f => f.id === tempId ? created : f))
        toast.success('Fornecedor cadastrado')
      } catch (err) {
        setFornecedores(fs => fs.filter(f => f.id !== tempId))
        toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar')
        throw err
      }
    }
    setEdicao(null)
  }

  async function handleExcluir() {
    if (!paraExcluir) return
    const backup = paraExcluir
    setFornecedores(fs => fs.filter(f => f.id !== backup.id))
    try {
      await deleteSupplierAction(backup.id)
      toast.success('Fornecedor excluído')
    } catch (err) {
      setFornecedores(fs => [...fs, backup])
      toast.error('Erro ao excluir')
      throw err
    }
    setParaExcluir(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">Fornecedores</h1>
          <p className="text-sm text-[#64748B]">
            {kpis.ativos} ativo{kpis.ativos !== 1 ? 's' : ''} · {kpis.pj} PJ · {kpis.pf} PF
          </p>
        </div>
        <Button onClick={() => { setEdicao(null); setModalForm(true) }} className="bg-synk-indigo hover:bg-synk-indigo-hover">
          <Plus className="size-4" strokeWidth={2} />Novo fornecedor
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Total de fornecedores" value={kpis.total} />
        <KpiCard label="Ativos"          value={kpis.ativos} color="#14b87e" bg="#d1fae5" />
        <KpiCard label="Pessoa Jurídica" value={kpis.pj}     color="#3d3ebf" bg="#eef0ff" />
        <KpiCard label="Pessoa Física"   value={kpis.pf}     color="#334155" bg="#F1F5F9" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <Input placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          {(['all', 'PJ', 'PF'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTipoFilter(t)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${tipoFilter === t ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'}`}>
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'ativo' | 'inativo')}
            className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <User className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhum fornecedor encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  {['Tipo', 'Fornecedor', 'Documento', 'Cidade / UF', 'Contato', 'Status', 'Ações'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 0 || i === 5 ? 'text-center' : i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={f.id} onClick={() => { setSelecionado(f); setModalDetalhe(true) }}
                    className={`cursor-pointer transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-[5px] px-2 py-0.5 text-[11px] font-bold ${f.tipo === 'PJ' ? 'bg-synk-indigo-light text-synk-indigo' : 'bg-[#d1fae5] text-[#14b87e]'}`}>{f.tipo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-synk-navy">{f.razaoSocial}</p>
                      {f.nomeFantasia && <p className="text-[11px] text-[#94A3B8]">{f.nomeFantasia}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#64748B]">{f.documento}</td>
                    <td className="px-4 py-3 text-[#374151]">{f.cidade} / {f.uf}</td>
                    <td className="px-4 py-3">
                      {f.email && <p className="text-[12px] text-[#4b5563]">{f.email}</p>}
                      {f.telefone && <p className="font-mono text-[12px] text-[#94A3B8]">{f.telefone}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${f.ativo ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                        <span className={`size-[5px] rounded-full ${f.ativo ? 'bg-[#14b87e]' : 'bg-[#94A3B8]'}`} />
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => openEditar(f)}
                          className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-synk-indigo transition-colors hover:border-synk-indigo hover:bg-synk-indigo-light">
                          <Settings className="size-3 text-synk-indigo" strokeWidth={1.5} />Editar
                        </button>
                        <button type="button" onClick={() => openExcluir(f)}
                          className="flex size-8 items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-synk-danger transition-colors hover:border-synk-danger hover:bg-[#fee2e2]"
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
            <span>Mostrando {filtered.length} de {fornecedores.length} fornecedores</span>
          </div>
        )}
      </div>

      {/* Modais — reutiliza os mesmos de clientes */}
      <ModalClienteForm
        open={modalForm}
        onClose={() => { setModalForm(false); setEdicao(null) }}
        onSave={handleSave}
        clienteEdicao={edicao}
        entityName="fornecedor"
      />
      <ModalClienteDetalhe
        open={modalDetalhe}
        onClose={() => setModalDetalhe(false)}
        cliente={selecionado}
        onEditar={() => selecionado && openEditar(selecionado)}
        onExcluir={() => selecionado && openExcluir(selecionado)}
        entityName="fornecedor"
      />
      <ModalExcluirCliente
        open={modalExcluir}
        onClose={() => setModalExcluir(false)}
        cliente={paraExcluir}
        onConfirm={handleExcluir}
        entityName="fornecedor"
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
