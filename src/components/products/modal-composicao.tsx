'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, Search, Trash2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from './modal-wrapper'
import { saveComponentsAction } from '@/app/actions/products'
import type { Produto, Componente } from './types'
import { formatBRL } from './types'

const UNIDADES = ['un', 'g', 'kg', 'mg', 'ml', 'L', 'm', 'cm', 'pç']

interface Props {
  open: boolean
  onClose: () => void
  produto: Produto | null
  todosProdutos: Produto[]
  initialComponentes?: Componente[]
  onSaved?: (componentes: Componente[]) => void
}

export function ModalComposicao({
  open, onClose, produto, todosProdutos, initialComponentes = [], onSaved,
}: Props) {
  const [componentes, setComponentes] = useState<Componente[]>(initialComponentes)
  const [busca, setBusca] = useState('')
  const [matSel, setMatSel] = useState<Produto | null>(null)
  const [qtd, setQtd] = useState('')
  const [unidade, setUnidade] = useState('un')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setComponentes(initialComponentes)
      setBusca('')
      setMatSel(null)
      setQtd('')
      setUnidade('un')
    }
  }, [open, produto?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const materiasPrimas = todosProdutos.filter(
    (p) => p.isMateriaPrima && p.id !== produto?.id,
  )

  const sugestoes = busca
    ? materiasPrimas.filter(
        (p) =>
          !componentes.find((c) => c.materialId === p.id) &&
          (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.sku.toLowerCase().includes(busca.toLowerCase())),
      ).slice(0, 6)
    : []

  function selecionar(p: Produto) {
    setMatSel(p)
    setBusca(p.nome)
  }

  function addMaterial() {
    if (!matSel || !qtd || parseFloat(qtd) <= 0) {
      toast.error('Selecione uma matéria-prima e informe a quantidade')
      return
    }
    if (componentes.find((c) => c.materialId === matSel.id)) {
      toast.error('Esta matéria-prima já foi adicionada')
      return
    }
    setComponentes((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        materialId: matSel.id,
        materialNome: matSel.nome,
        materialSku: matSel.sku,
        quantidade: parseFloat(qtd),
        unidade,
      },
    ])
    setMatSel(null)
    setBusca('')
    setQtd('')
    setUnidade('un')
  }

  async function handleSave() {
    if (!produto) return
    setSaving(true)
    try {
      const saved = await saveComponentsAction(
        produto.id,
        componentes.map((c) => ({
          materialId: c.materialId,
          quantidade: c.quantidade,
          unidade: c.unidade,
        })),
      )
      setComponentes(saved)
      onSaved?.(saved)
      toast.success('Composição salva! Ao dar entrada neste produto, as matérias-primas serão descontadas automaticamente.')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar composição')
    } finally {
      setSaving(false)
    }
  }

  if (!produto) return null

  const custoTotal = componentes.reduce((acc, c) => {
    const mat = todosProdutos.find((p) => p.id === c.materialId)
    return acc + (mat?.precoCusto ?? mat?.preco ?? 0) * c.quantidade
  }, 0)

  return (
    <ModalWrapper open={open} onClose={onClose} title={`Composição — ${produto.nome}`} width="max-w-xl">
      <div className="flex flex-col gap-5 p-4 sm:p-6">

        {/* Info */}
        <div className="flex items-start gap-3 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3.5">
          <Layers className="mt-0.5 size-4 shrink-0 text-[#2563eb]" strokeWidth={1.5} />
          <p className="text-[13px] text-[#1e40af]">
            Defina quantas matérias-primas são necessárias para produzir <strong>1 unidade</strong> de <strong>{produto.nome}</strong>.
            Ao dar entrada no estoque deste produto, as matérias-primas serão descontadas automaticamente.
          </p>
        </div>

        {/* Adicionar material */}
        <div className="flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Adicionar matéria-prima</p>
          <div className="flex gap-2">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
              <input
                placeholder="Buscar por nome ou SKU..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); if (!e.target.value) setMatSel(null) }}
                className="h-9 w-full rounded-md border border-[#E2E8F0] bg-white pl-8 pr-3 text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-1 focus:ring-synk-indigo/20"
                autoComplete="off"
              />
              {sugestoes.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-[#E2E8F0] bg-white shadow-lg">
                  {sugestoes.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selecionar(p)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[#F8F9FC]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-synk-navy">{p.nome}</p>
                        <p className="font-mono text-[11px] text-[#94A3B8]">{p.sku} · {p.qtd} em estoque</p>
                      </div>
                      <span className="font-mono text-[12px] text-[#64748B]">{formatBRL(p.precoCusto ?? p.preco)}</span>
                    </button>
                  ))}
                </div>
              )}
              {busca && sugestoes.length === 0 && !matSel && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-2 shadow-md">
                  <p className="text-[12px] text-[#94A3B8]">Nenhuma matéria-prima encontrada. Cadastre o produto e marque como matéria-prima primeiro.</p>
                </div>
              )}
            </div>

            {/* Qtd */}
            <input
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Qtd"
              value={qtd}
              onChange={(e) => setQtd(e.target.value)}
              className="h-9 w-20 rounded-md border border-[#E2E8F0] bg-white px-2 text-center text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none"
            />

            {/* Unidade */}
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="h-9 rounded-md border border-[#E2E8F0] bg-white px-2 text-[13px] text-synk-navy focus:outline-none"
            >
              {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <Button
              type="button"
              onClick={addMaterial}
              disabled={!matSel || !qtd}
              className="h-9 bg-synk-indigo hover:bg-synk-indigo-hover px-3"
            >
              <Plus className="size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Lista de componentes */}
        {componentes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-[#E2E8F0] py-8 text-center">
            <Layers className="size-8 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[14px] font-semibold text-synk-navy">Nenhuma matéria-prima adicionada</p>
            <p className="text-[13px] text-[#94A3B8]">Adicione os materiais necessários para produzir este produto</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Matéria-Prima</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Quantidade</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {componentes.map((c, i) => (
                    <tr key={c.materialId} className={i < componentes.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-synk-navy">{c.materialNome}</p>
                        <p className="font-mono text-[11px] text-synk-indigo">{c.materialSku}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[13px] font-semibold text-synk-navy">
                        {c.quantidade} <span className="text-[11px] font-normal text-[#94A3B8]">{c.unidade}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          onClick={() => setComponentes((prev) => prev.filter((x) => x.materialId !== c.materialId))}
                          className="flex size-7 items-center justify-center rounded text-[#94A3B8] transition-colors hover:bg-[#fee2e2] hover:text-[#ef4444]"
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custo estimado */}
            {custoTotal > 0 && (
              <p className="text-[12px] text-[#64748B]">
                Custo estimado de matérias-primas por unidade:{' '}
                <span className="font-semibold text-synk-navy">{formatBRL(custoTotal)}</span>
              </p>
            )}
          </>
        )}

        <div className="flex gap-2.5 border-t border-[#F1F5F9] pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="flex-[2] bg-synk-indigo hover:bg-synk-indigo-hover">
            {saving
              ? <><Loader2 className="size-4 animate-spin" />Salvando...</>
              : 'Salvar composição'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
