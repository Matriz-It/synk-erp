'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Loader2, Plus, Settings, Trash2, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from './modal-wrapper'
import { type Produto, type Movimentacao, type Componente, stockStatus, formatBRL, formatDate, CAT_LABEL } from './types'
import { saveComponentsAction } from '@/app/actions/products'

const UNIDADES = ['un', 'g', 'kg', 'mg', 'ml', 'L', 'm', 'cm', 'pç']

export function ModalDetalhe({
  open,
  onClose,
  produto,
  movimentacoes,
  loadingMovs,
  onNovaMovimentacao,
  onEditar,
  initialComponentes = [],
  todosProdutos = [],
}: {
  open: boolean
  onClose: () => void
  produto: Produto | null
  movimentacoes: Movimentacao[]
  loadingMovs?: boolean
  onNovaMovimentacao: () => void
  onEditar: () => void
  initialComponentes?: Componente[]
  todosProdutos?: Produto[]
}) {
  if (!produto) return null
  const st = stockStatus(produto)
  const isLoadingMovs = loadingMovs ?? false

  // ── Composição ────────────────────────────────────────────────────
  const [componentes, setComponentes] = useState<Componente[]>(initialComponentes)
  const [novoMaterialId, setNovoMaterialId] = useState('')
  const [novaQtd, setNovaQtd] = useState('')
  const [novaUnidade, setNovaUnidade] = useState('un')
  const [savingComp, setSavingComp] = useState(false)
  const [buscaMat, setBuscaMat] = useState('')

  const materiasPrimas = todosProdutos.filter((p) => p.isMateriaPrima && p.id !== produto.id)
  const materiasFiltradas = buscaMat
    ? materiasPrimas.filter((p) => p.nome.toLowerCase().includes(buscaMat.toLowerCase()) || p.sku.toLowerCase().includes(buscaMat.toLowerCase()))
    : []

  function addComponente() {
    if (!novoMaterialId || !novaQtd || parseFloat(novaQtd) <= 0) return
    const mat = materiasPrimas.find((p) => p.id === novoMaterialId)
    if (!mat) return
    if (componentes.find((c) => c.materialId === novoMaterialId)) {
      toast.error('Esta matéria-prima já foi adicionada')
      return
    }
    setComponentes((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      materialId: novoMaterialId,
      materialNome: mat.nome,
      materialSku: mat.sku,
      quantidade: parseFloat(novaQtd),
      unidade: novaUnidade,
    }])
    setNovoMaterialId('')
    setNovaQtd('')
    setBuscaMat('')
  }

  function removeComponente(materialId: string) {
    setComponentes((prev) => prev.filter((c) => c.materialId !== materialId))
  }

  async function saveComposicao() {
    setSavingComp(true)
    try {
      const saved = await saveComponentsAction(produto.id, componentes.map((c) => ({
        materialId: c.materialId,
        quantidade: c.quantidade,
        unidade: c.unidade,
      })))
      setComponentes(saved)
      toast.success('Composição salva com sucesso!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar composição')
    } finally {
      setSavingComp(false)
    }
  }

  const showComposicao = !produto.isMateriaPrima

  return (
    <ModalWrapper open={open} onClose={onClose} title={produto.nome} width="max-w-2xl">
      <div className="space-y-5 p-4 sm:p-6">
        {/* Badge matéria-prima */}
        {produto.isMateriaPrima && (
          <div className="flex items-center gap-2 rounded-lg border border-[#fef3c7] bg-[#fffbeb] px-3 py-2">
            <Layers className="size-4 text-[#f59e0b]" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold text-[#92400e]">Matéria-Prima — usada na composição de outros produtos</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <InfoCard label="Estoque atual" value={`${produto.qtd} un.`} color={st === 'ok' ? '#14b87e' : '#ef4444'} bg={st === 'ok' ? '#d1fae5' : '#fee2e2'} />
          <InfoCard label="Preço de venda" value={formatBRL(produto.preco)} color="#0f172a" bg="#f8f9fc" />
          <InfoCard label="SKU" value={produto.sku} color="#3d3ebf" bg="#eef0ff" mono />
        </div>

        {st !== 'ok' && (
          <div className={`flex items-start gap-2.5 rounded-lg px-3.5 py-3 ${st === 'zero' ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#fef3c7] text-[#f59e0b]'}`}>
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            <p className="text-sm font-medium">
              {st === 'zero' ? 'Produto sem estoque — reponha imediatamente.' : `Estoque abaixo do mínimo (${produto.qtdMin} un.). Considere repor.`}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" onClick={onNovaMovimentacao} className="bg-synk-indigo hover:bg-synk-indigo-hover">
            <Plus className="size-4" strokeWidth={1.5} />Nova movimentação
          </Button>
          <Button type="button" variant="outline" onClick={onEditar}>
            <Settings className="size-4" strokeWidth={1.5} />Editar produto
          </Button>
        </div>

        {/* ── Composição / Ficha Técnica ──────────────────────────── */}
        {showComposicao && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              <Layers className="size-3.5" strokeWidth={1.5} />
              Composição (matérias-primas por unidade)
            </h3>

            {/* Adicionar material */}
            <div className="mb-3 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    placeholder="Buscar matéria-prima..."
                    value={buscaMat || (novoMaterialId ? materiasPrimas.find(p => p.id === novoMaterialId)?.nome : '')}
                    onChange={(e) => { setBuscaMat(e.target.value); setNovoMaterialId('') }}
                    className="h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-1 focus:ring-synk-indigo/20"
                  />
                  {materiasFiltradas.length > 0 && !novoMaterialId && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-[#E2E8F0] bg-white shadow-lg">
                      {materiasFiltradas.slice(0, 5).map((p) => (
                        <button key={p.id} type="button"
                          onClick={() => { setNovoMaterialId(p.id); setBuscaMat('') }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F8F9FC]">
                          <span className="font-medium text-synk-navy">{p.nome}</span>
                          <span className="text-[11px] text-[#94A3B8]">{p.sku}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="Qtd"
                  value={novaQtd}
                  onChange={(e) => setNovaQtd(e.target.value)}
                  className="h-9 w-20 rounded-md border border-[#E2E8F0] bg-white px-2 text-center text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none"
                />
                <select
                  value={novaUnidade}
                  onChange={(e) => setNovaUnidade(e.target.value)}
                  className="h-9 rounded-md border border-[#E2E8F0] bg-white px-2 text-[13px] text-synk-navy focus:outline-none"
                >
                  {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <Button type="button" onClick={addComponente} disabled={!novoMaterialId || !novaQtd}
                  className="h-9 bg-synk-indigo hover:bg-synk-indigo-hover px-3">
                  <Plus className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>

            {/* Lista de componentes */}
            {componentes.length === 0 ? (
              <p className="rounded-lg border border-[#E2E8F0] py-5 text-center text-[13px] text-[#94A3B8]">
                Nenhuma matéria-prima adicionada. Este produto não tem ficha técnica.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                      {['Matéria-Prima', 'SKU', 'Quantidade', ''].map((h, i) => (
                        <th key={i} className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {componentes.map((c, i) => (
                      <tr key={c.materialId} className={i < componentes.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
                        <td className="px-3 py-2.5 font-medium text-synk-navy">{c.materialNome}</td>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-synk-indigo">{c.materialSku}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-[13px] font-semibold text-synk-navy">
                          {c.quantidade} <span className="text-[11px] font-normal text-[#94A3B8]">{c.unidade}</span>
                        </td>
                        <td className="px-2 py-2.5">
                          <button type="button" onClick={() => removeComponente(c.materialId)}
                            className="flex size-7 items-center justify-center rounded text-[#94A3B8] transition-colors hover:bg-[#fee2e2] hover:text-[#ef4444]">
                            <Trash2 className="size-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-2 flex justify-end">
              <Button type="button" onClick={saveComposicao} disabled={savingComp} className="bg-synk-indigo hover:bg-synk-indigo-hover">
                {savingComp ? <><Loader2 className="size-4 animate-spin" />Salvando...</> : 'Salvar composição'}
              </Button>
            </div>
          </div>
        )}

        {/* ── Movimentações ─────────────────────────────────────── */}
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Histórico de movimentações</h3>
          {isLoadingMovs ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] py-8 text-[#94A3B8]">
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              <span className="text-sm">Carregando movimentações...</span>
            </div>
          ) : movimentacoes.length === 0 ? (
            <p className="rounded-lg border border-[#E2E8F0] py-8 text-center text-sm text-[#94A3B8]">Nenhuma movimentação registrada ainda.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                    {['Tipo', 'Qtd', 'Motivo', 'Data', 'Saldo após'].map((h, i) => (
                      <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 1 || i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((m, i) => (
                    <tr key={m.id} className={`transition-colors hover:bg-[#F8F9FC] ${i < movimentacoes.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${m.tipo === 'entrada' ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#fee2e2] text-[#ef4444]'}`}>
                          {m.tipo === 'entrada' ? <ArrowDownRight className="size-3" strokeWidth={2} /> : <ArrowUpRight className="size-3" strokeWidth={2} />}
                          {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-synk-navy">{m.qtd}</td>
                      <td className="px-4 py-3 text-[#64748B]">{m.motivo}</td>
                      <td className="px-4 py-3 text-[#64748B]">{formatDate(m.data)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-synk-navy">{m.saldoApos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 border-t border-[#E2E8F0] pt-4 text-[13px]">
          <MetaItem label="Categoria" value={CAT_LABEL[produto.categoria] ?? produto.categoria} />
          <MetaItem label="Criado em" value={formatDate(produto.criadoEm)} />
          <MetaItem label="Tipo" value={produto.isMateriaPrima ? 'Matéria-Prima' : 'Produto Acabado'} color={produto.isMateriaPrima ? '#f59e0b' : '#64748b'} />
          <MetaItem label="Status" value={produto.ativo ? 'Ativo' : 'Inativo'} color={produto.ativo ? '#14b87e' : '#94a3b8'} />
        </div>
      </div>
    </ModalWrapper>
  )
}

function InfoCard({ label, value, color, bg, mono }: { label: string; value: string; color: string; bg: string; mono?: boolean }) {
  return (
    <div className="rounded-lg p-3" style={{ background: bg }}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className={`mt-1 text-base font-bold ${mono ? 'font-mono' : 'font-display'}`} style={{ color }}>{value}</p>
    </div>
  )
}

function MetaItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <span>
      <span className="text-[#94A3B8]">{label}: </span>
      <span className="font-medium" style={color ? { color } : undefined}>{value}</span>
    </span>
  )
}
