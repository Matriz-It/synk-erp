'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ArrowUpDown, Package, PackageSearch, Plus, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createMovementAction,
  createProductAction,
  getProductDetailAction,
  updateProductAction,
} from '@/app/actions/products'
import { ModalCadastro } from './modal-cadastro'
import { ModalDetalhe } from './modal-detalhe'
import { ModalMovimentacao } from './modal-movimentacao'
import {
  type Movimentacao,
  type MovMap,
  type Produto,
  CAT_LABEL,
  CATEGORIAS,
  formatBRL,
  stockStatus,
} from './types'

type SortKey = 'nome' | 'preco' | 'qtd'
type StatusFilter = 'all' | 'ativo' | 'inativo' | 'baixo' | 'zerado'

export function ProdutosView({ initialProdutos }: { initialProdutos: Produto[] }) {
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos)
  const [movMap, setMovMap] = useState<MovMap>({})
  const [loadingMovs, setLoadingMovs] = useState(false)

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [modalCadastro, setModalCadastro] = useState(false)
  const [produtoEdicao, setProdutoEdicao] = useState<Produto | null>(null)
  const [modalDetalhe, setModalDetalhe] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [modalMovimentacao, setModalMovimentacao] = useState(false)

  const filtered = useMemo(() => {
    let list = [...produtos]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }
    if (catFilter !== 'all') list = list.filter((p) => p.categoria === catFilter)
    if (statusFilter === 'ativo') list = list.filter((p) => p.ativo)
    else if (statusFilter === 'inativo') list = list.filter((p) => !p.ativo)
    else if (statusFilter === 'baixo') list = list.filter((p) => stockStatus(p) === 'low')
    else if (statusFilter === 'zerado') list = list.filter((p) => p.qtd === 0)

    list.sort((a, b) => {
      let d = 0
      if (sortBy === 'nome') d = a.nome.localeCompare(b.nome)
      else if (sortBy === 'preco') d = a.preco - b.preco
      else d = a.qtd - b.qtd
      return sortDir === 'asc' ? d : -d
    })
    return list
  }, [produtos, search, catFilter, statusFilter, sortBy, sortDir])

  const kpis = useMemo(() => ({
    total: produtos.length,
    ativos: produtos.filter((p) => p.ativo).length,
    baixo: produtos.filter((p) => stockStatus(p) === 'low').length,
    zerado: produtos.filter((p) => p.qtd === 0).length,
    valor: produtos.reduce((acc, p) => acc + p.preco * p.qtd, 0),
  }), [produtos])

  const valorFiltrado = filtered.reduce((acc, p) => acc + p.preco * p.qtd, 0)

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(key); setSortDir('asc') }
  }

  async function openDetalhe(p: Produto) {
    setProdutoSelecionado(p)
    setModalDetalhe(true)
    if (!movMap[p.id]) {
      setLoadingMovs(true)
      try {
        const detail = await getProductDetailAction(p.id)
        setMovMap((m) => ({ ...m, [p.id]: detail.movimentacoes }))
        setProdutoSelecionado(detail)
        setProdutos((ps) => ps.map((x) => x.id === p.id ? { ...x, qtd: detail.qtd } : x))
      } catch {
        toast.error('Erro ao carregar movimentações')
      } finally {
        setLoadingMovs(false)
      }
    }
  }

  function openEditar(p: Produto) {
    setProdutoEdicao(p)
    setModalDetalhe(false)
    setModalCadastro(true)
  }

  function openMovimentacao(p: Produto) { setProdutoSelecionado(p); setModalMovimentacao(true) }

  async function handleSaveProduto(data: Omit<Produto, 'id' | 'criadoEm'> & { qtdInicial: number }) {
    if (produtoEdicao) {
      const optimistic = { ...produtoEdicao, ...data }
      setProdutos((ps) => ps.map((p) => p.id === produtoEdicao.id ? optimistic : p))
      try {
        const updated = await updateProductAction(produtoEdicao.id, {
          sku: data.sku, nome: data.nome, categoria: data.categoria,
          preco: data.preco, qtdMin: data.qtdMin, ativo: data.ativo, foto: data.foto,
        })
        setProdutos((ps) => ps.map((p) => p.id === produtoEdicao.id ? updated : p))
        toast.success('Produto atualizado')
      } catch (err) {
        setProdutos((ps) => ps.map((p) => p.id === produtoEdicao.id ? produtoEdicao : p))
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar produto')
        throw err
      }
    } else {
      const tempId = `temp-${Date.now()}`
      const temp: Produto = { ...data, id: tempId, criadoEm: new Date().toISOString().split('T')[0] }
      setProdutos((ps) => [...ps, temp])
      try {
        const created = await createProductAction({
          sku: data.sku, nome: data.nome, categoria: data.categoria,
          preco: data.preco, qtdInicial: data.qtdInicial, qtdMin: data.qtdMin,
          ativo: data.ativo, foto: data.foto ?? undefined,
        })
        setProdutos((ps) => ps.map((p) => p.id === tempId ? created : p))
        if (data.qtdInicial > 0) {
          setMovMap((m) => ({
            ...m,
            [created.id]: [{ id: `init-${Date.now()}`, tipo: 'entrada' as const, qtd: data.qtdInicial, motivo: 'Estoque inicial', data: created.criadoEm, operador: 'Sistema', saldoApos: data.qtdInicial }],
          }))
        }
        toast.success('Produto cadastrado')
      } catch (err) {
        setProdutos((ps) => ps.filter((p) => p.id !== tempId))
        toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar produto')
        throw err
      }
    }
    setProdutoEdicao(null)
  }

  async function handleSaveMovimentacao(mov: Omit<Movimentacao, 'id' | 'operador'>) {
    if (!produtoSelecionado) return

    const optimisticMov: Movimentacao = { ...mov, id: `temp-${Date.now()}`, operador: '...' }
    setMovMap((m) => ({ ...m, [produtoSelecionado.id]: [optimisticMov, ...(m[produtoSelecionado.id] ?? [])] }))
    setProdutos((ps) => ps.map((p) => p.id === produtoSelecionado.id ? { ...p, qtd: mov.saldoApos } : p))
    setProdutoSelecionado((p) => p ? { ...p, qtd: mov.saldoApos } : p)

    try {
      const real = await createMovementAction(produtoSelecionado.id, {
        tipo: mov.tipo, qtd: mov.qtd, motivo: mov.motivo,
      })
      setMovMap((m) => ({
        ...m,
        [produtoSelecionado.id]: (m[produtoSelecionado.id] ?? []).map((x) => x.id === optimisticMov.id ? real : x),
      }))
      toast.success(mov.tipo === 'entrada' ? 'Entrada registrada' : 'Saída registrada')
    } catch (err) {
      setMovMap((m) => ({
        ...m,
        [produtoSelecionado.id]: (m[produtoSelecionado.id] ?? []).filter((x) => x.id !== optimisticMov.id),
      }))
      setProdutos((ps) => ps.map((p) => p.id === produtoSelecionado.id ? { ...p, qtd: produtoSelecionado.qtd } : p))
      setProdutoSelecionado((p) => p ? { ...p, qtd: produtoSelecionado.qtd } : p)
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar movimentação')
      throw err
    }
  }

  const existingSkus = produtos.map((p) => p.sku)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-synk-navy">Produtos</h1>
          <p className="text-sm text-[#64748B]">Gerencie seu catálogo e controle de estoque</p>
        </div>
        <Button
          onClick={() => { setProdutoEdicao(null); setModalCadastro(true) }}
          className="bg-synk-indigo hover:bg-synk-indigo-hover"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Novo produto
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total de produtos" value={kpis.total} />
        <KpiCard label="Produtos ativos" value={kpis.ativos} color="#14b87e" bg="#d1fae5" />
        <KpiCard label="Estoque baixo" value={kpis.baixo} color="#f59e0b" bg="#fef3c7" />
        <KpiCard label="Sem estoque" value={kpis.zerado} color="#ef4444" bg="#fee2e2" />
        <KpiCard label="Valor em estoque" value={formatBRL(kpis.valor)} color="#3d3ebf" bg="#eef0ff" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
            <Input placeholder="Buscar por nome ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
              <option value="all">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="baixo">Estoque baixo</option>
              <option value="zerado">Sem estoque</option>
            </select>
            <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [k, d] = e.target.value.split('-') as [SortKey, 'asc' | 'desc']; setSortBy(k); setSortDir(d) }} className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
              <option value="nome-asc">Nome A→Z</option>
              <option value="nome-desc">Nome Z→A</option>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
              <option value="qtd-asc">Menor estoque</option>
              <option value="qtd-desc">Maior estoque</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIAS.map((c) => (
            <button key={c.id} type="button" onClick={() => setCatFilter(c.id)} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${catFilter === c.id ? 'bg-synk-indigo text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <PackageSearch className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#64748B]">Nenhum produto encontrado</p>
            <p className="text-xs text-[#94A3B8]">Tente ajustar os filtros ou cadastre um novo produto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  <th className="w-12 px-4 py-3" />
                  <SortTh label="Nome" k="nome" current={sortBy} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">SKU</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Categoria</th>
                  <SortTh label="Preço" k="preco" current={sortBy} dir={sortDir} onSort={toggleSort} right />
                  <SortTh label="Estoque" k="qtd" current={sortBy} dir={sortDir} onSort={toggleSort} right />
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const st = stockStatus(p)
                  const qtdColor = st === 'ok' ? '#0f172a' : st === 'low' ? '#f59e0b' : '#ef4444'
                  return (
                    <tr key={p.id} onClick={() => openDetalhe(p)} className={`cursor-pointer transition-colors hover:bg-[#F8F9FC] ${i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#F1F5F9]">
                          <Package className="size-4 text-[#94A3B8]" strokeWidth={1.5} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-synk-navy">{p.nome}</td>
                      <td className="px-4 py-3 font-mono text-xs text-synk-indigo">{p.sku}</td>
                      <td className="px-4 py-3 text-[#64748B]">{CAT_LABEL[p.categoria] ?? p.categoria}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-synk-navy">{formatBRL(p.preco)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold" style={{ color: qtdColor }}>
                          {p.qtd}{st !== 'ok' && <AlertTriangle className="size-3.5" strokeWidth={1.5} />}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${p.ativo ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                          <span className={`size-1.5 rounded-full ${p.ativo ? 'bg-[#14b87e]' : 'bg-[#94A3B8]'}`} />
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => openMovimentacao(p)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-synk-indigo ring-1 ring-synk-indigo/20 transition-colors hover:bg-synk-indigo-light">
                            Movimentar
                          </button>
                          <button type="button" onClick={() => openEditar(p)} className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-synk-navy" aria-label="Editar">
                            <Settings className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3 text-[13px] text-[#64748B]">
            <span>{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
            <span>Valor total: <span className="font-mono font-semibold text-synk-navy">{formatBRL(valorFiltrado)}</span></span>
          </div>
        )}
      </div>

      <ModalCadastro
        open={modalCadastro}
        onClose={() => { setModalCadastro(false); setProdutoEdicao(null) }}
        onSave={handleSaveProduto}
        existingSkus={existingSkus}
        produtoEdicao={produtoEdicao}
      />
      <ModalDetalhe
        open={modalDetalhe}
        onClose={() => setModalDetalhe(false)}
        produto={produtoSelecionado}
        movimentacoes={produtoSelecionado ? (movMap[produtoSelecionado.id] ?? []) : []}
        loadingMovs={loadingMovs}
        onNovaMovimentacao={() => { setModalDetalhe(false); setModalMovimentacao(true) }}
        onEditar={() => produtoSelecionado && openEditar(produtoSelecionado)}
      />
      <ModalMovimentacao
        open={modalMovimentacao}
        onClose={() => setModalMovimentacao(false)}
        produto={produtoSelecionado}
        onSave={handleSaveMovimentacao}
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

function SortTh({ label, k, current, dir, onSort, right }: { label: string; k: SortKey; current: SortKey; dir: 'asc' | 'desc'; onSort: (k: SortKey) => void; right?: boolean }) {
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
