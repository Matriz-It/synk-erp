'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AlertCircle, Layers, Loader2, Package, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ModalWrapper } from './modal-wrapper'
import { saveComponentsAction } from '@/app/actions/products'
import { type Componente, type Produto, CATEGORIAS } from './types'

const UNIDADES = ['un', 'g', 'kg', 'mg', 'ml', 'L', 'm', 'cm', 'pç']

interface FormState {
  nome: string
  sku: string
  categoria: string
  preco: number
  precoCusto: number
  qtdInicial: string
  ativo: boolean
  isMateriaPrima: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

function validate(form: FormState, existingSkus: string[], isEditing: boolean, editSku?: string): FormErrors {
  const e: FormErrors = {}
  if (!form.nome.trim()) e.nome = 'Informe o nome do produto'
  const sku = form.sku.toUpperCase().trim()
  if (!sku) {
    e.sku = 'Informe o SKU'
  } else if (!isEditing && existingSkus.includes(sku)) {
    e.sku = 'SKU já cadastrado'
  } else if (isEditing && sku !== editSku && existingSkus.includes(sku)) {
    e.sku = 'SKU já cadastrado'
  }
  if (form.preco <= 0) e.preco = 'Informe um preço válido'
  if (!isEditing && form.qtdInicial.trim()) {
    const qtd = parseInt(form.qtdInicial)
    if (isNaN(qtd) || qtd < 0) e.qtdInicial = 'Quantidade inválida'
  }
  return e
}

export function ModalCadastro({
  open,
  onClose,
  onSave,
  existingSkus,
  produtoEdicao,
  todosProdutos = [],
  initialComponentes = [],
  onComponentesSaved,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Produto, 'id' | 'criadoEm'> & { qtdInicial: number }) => Promise<Produto>
  existingSkus: string[]
  produtoEdicao: Produto | null
  todosProdutos?: Produto[]
  initialComponentes?: Componente[]
  onComponentesSaved?: (productId: string, componentes: Componente[]) => void
}) {
  const isEditing = !!produtoEdicao

  const [form, setForm] = useState<FormState>({
    nome: '', sku: '', categoria: 'alimentos', preco: 0, precoCusto: 0,
    qtdInicial: '', ativo: true, isMateriaPrima: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  // ── Composição inline ─────────────────────────────────────────────
  const [componentes, setComponentes] = useState<Componente[]>(initialComponentes)
  const [buscaMat, setBuscaMat] = useState('')
  const [matSel, setMatSel] = useState<Produto | null>(null)
  const [novaQtd, setNovaQtd] = useState('')
  const [novaUnidade, setNovaUnidade] = useState('un')

  useEffect(() => {
    if (!open) return
    if (produtoEdicao) {
      setForm({
        nome: produtoEdicao.nome, sku: produtoEdicao.sku,
        categoria: produtoEdicao.categoria, preco: produtoEdicao.preco,
        precoCusto: produtoEdicao.precoCusto ?? 0, qtdInicial: '',
        ativo: produtoEdicao.ativo, isMateriaPrima: produtoEdicao.isMateriaPrima,
      })
    } else {
      setForm({ nome: '', sku: '', categoria: 'alimentos', preco: 0, precoCusto: 0, qtdInicial: '', ativo: true, isMateriaPrima: false })
    }
    setComponentes(initialComponentes)
    setBuscaMat(''); setMatSel(null); setNovaQtd(''); setNovaUnidade('un')
    setErrors({})
  }, [open, produtoEdicao]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const materiasPrimas = todosProdutos.filter(
    (p) => p.isMateriaPrima && p.id !== produtoEdicao?.id
  )
  const sugestoes = buscaMat
    ? materiasPrimas.filter(
        (p) => !componentes.find((c) => c.materialId === p.id) &&
          (p.nome.toLowerCase().includes(buscaMat.toLowerCase()) || p.sku.toLowerCase().includes(buscaMat.toLowerCase()))
      ).slice(0, 5)
    : []

  function selecionarMaterial(p: Produto) { setMatSel(p); setBuscaMat(p.nome) }

  function addComponente() {
    if (!matSel || !novaQtd || parseFloat(novaQtd) <= 0) return
    if (componentes.find((c) => c.materialId === matSel.id)) {
      toast.error('Já adicionada'); return
    }
    setComponentes((prev) => [...prev, {
      id: `new-${Date.now()}`, materialId: matSel.id,
      materialNome: matSel.nome, materialSku: matSel.sku,
      quantidade: parseFloat(novaQtd), unidade: novaUnidade,
    }])
    setMatSel(null); setBuscaMat(''); setNovaQtd(''); setNovaUnidade('un')
  }

  async function handleSubmit() {
    const errs = validate(form, existingSkus, isEditing, produtoEdicao?.sku)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      const saved = await onSave({
        sku: form.sku.toUpperCase().trim(), nome: form.nome.trim(),
        categoria: form.categoria, preco: form.preco,
        precoCusto: form.precoCusto > 0 ? form.precoCusto : null,
        isMateriaPrima: form.isMateriaPrima,
        qtd: isEditing ? (produtoEdicao?.qtd ?? 0) : (parseInt(form.qtdInicial) || 0),
        qtdMin: produtoEdicao?.qtdMin ?? 10,
        ativo: form.ativo, foto: produtoEdicao?.foto ?? null,
        qtdInicial: parseInt(form.qtdInicial) || 0,
      })

      // Salva composição se não for matéria-prima
      if (!form.isMateriaPrima && saved?.id) {
        try {
          const savedComps = await saveComponentsAction(
            saved.id,
            componentes.map((c) => ({ materialId: c.materialId, quantidade: c.quantidade, unidade: c.unidade })),
          )
          onComponentesSaved?.(saved.id, savedComps)
        } catch (compErr) {
          toast.error(compErr instanceof Error ? compErr.message : 'Erro ao salvar composição')
          return // não fecha o modal se a composição falhou
        }
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const categoriasOpts = CATEGORIAS.filter((c) => c.id !== 'all')

  return (
    <ModalWrapper open={open} onClose={onClose} title={isEditing ? 'Editar Produto' : 'Novo Produto'}>
      <div className="space-y-5 p-4 sm:p-6">

        {/* ── Tipo: Produto | Matéria-Prima ── */}
        <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={() => set('isMateriaPrima', false)}
              className={`flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold transition-colors ${
                !form.isMateriaPrima ? 'bg-synk-indigo text-white' : 'text-[#64748B] hover:bg-[#F8F9FC]'
              }`}
            >
              <Package className="size-4" strokeWidth={1.5} />
              Produto
            </button>
            <button
              type="button"
              onClick={() => set('isMateriaPrima', true)}
              className={`flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold transition-colors ${
                form.isMateriaPrima ? 'bg-[#f59e0b] text-white' : 'text-[#64748B] hover:bg-[#F8F9FC]'
              }`}
            >
              <Layers className="size-4" strokeWidth={1.5} />
              Matéria-Prima
            </button>
          </div>
        </div>

        {form.isMateriaPrima && (
          <div className="flex items-center gap-2 rounded-lg border border-[#fef3c7] bg-[#fffbeb] px-3 py-2">
            <Layers className="size-4 shrink-0 text-[#f59e0b]" strokeWidth={1.5} />
            <p className="text-[12px] text-[#92400e]">
              Matérias-primas são usadas na composição de outros produtos e têm o estoque descontado automaticamente na produção.
            </p>
          </div>
        )}

        {/* ── Campos do produto ── */}
        <Field label="Nome do produto" error={errors.nome} required>
          <Input
            placeholder={form.isMateriaPrima ? 'Ex: Plástico ABS' : 'Ex: Caneta Esferográfica'}
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            className={errors.nome ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU" error={errors.sku} required>
            <Input
              placeholder="Ex: MAT-001"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value.toUpperCase())}
              className={`font-mono ${errors.sku ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''}`}
            />
          </Field>
          <Field label="Categoria">
            <select
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
              className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
            >
              {categoriasOpts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Preço de venda" error={errors.preco} required>
            <CurrencyInput value={form.preco} onChange={(v) => set('preco', v)} error={!!errors.preco} />
          </Field>
          <Field label="Preço de custo">
            <CurrencyInput value={form.precoCusto} onChange={(v) => set('precoCusto', v)} placeholder="0,00 (opcional)" />
          </Field>
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Qtd. inicial" error={errors.qtdInicial}>
              <Input
                placeholder="0"
                value={form.qtdInicial}
                onChange={(e) => set('qtdInicial', e.target.value)}
                className={`font-mono ${errors.qtdInicial ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''}`}
                inputMode="numeric"
              />
            </Field>
          </div>
        )}

        {/* ── Composição (só para Produto) ── */}
        {!form.isMateriaPrima && (
          <div className="space-y-3 rounded-lg border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-[#2563eb]" strokeWidth={1.5} />
              <p className="text-[13px] font-semibold text-synk-navy">Composição (opcional)</p>
              <p className="text-[12px] text-[#94A3B8]">— matérias-primas por unidade</p>
            </div>

            {materiasPrimas.length === 0 ? (
              <p className="text-[12px] text-[#94A3B8]">Nenhuma matéria-prima cadastrada ainda. Cadastre um produto como Matéria-Prima primeiro.</p>
            ) : (
              <>
                {/* Adicionar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
                    <input
                      placeholder="Buscar matéria-prima..."
                      value={buscaMat}
                      onChange={(e) => { setBuscaMat(e.target.value); if (!e.target.value) setMatSel(null) }}
                      className="h-9 w-full rounded-md border border-[#E2E8F0] bg-white pl-8 pr-3 text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-1 focus:ring-synk-indigo/20"
                      autoComplete="off"
                    />
                    {sugestoes.length > 0 && !matSel && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-[#E2E8F0] bg-white shadow-lg">
                        {sugestoes.map((p) => (
                          <button key={p.id} type="button" onClick={() => selecionarMaterial(p)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#F8F9FC]">
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-[13px] font-medium text-synk-navy">{p.nome}</p>
                              <p className="font-mono text-[11px] text-[#94A3B8]">{p.sku} · {p.qtd} em estoque</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="number" step="0.001" min="0.001" placeholder="Qtd"
                    value={novaQtd} onChange={(e) => setNovaQtd(e.target.value)}
                    className="h-9 w-16 rounded-md border border-[#E2E8F0] bg-white px-2 text-center text-[13px] text-synk-navy focus:border-synk-indigo focus:outline-none"
                  />
                  <select value={novaUnidade} onChange={(e) => setNovaUnidade(e.target.value)}
                    className="h-9 rounded-md border border-[#E2E8F0] bg-white px-2 text-[13px] text-synk-navy focus:outline-none">
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <Button type="button" onClick={addComponente} disabled={!matSel || !novaQtd}
                    className="h-9 bg-synk-indigo hover:bg-synk-indigo-hover px-3">
                    <Plus className="size-4" strokeWidth={2} />
                  </Button>
                </div>

                {/* Lista */}
                {componentes.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
                    <table className="w-full text-sm">
                      <tbody>
                        {componentes.map((c, i) => (
                          <tr key={c.materialId} className={i < componentes.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
                            <td className="px-3 py-2">
                              <p className="text-[13px] font-medium text-synk-navy">{c.materialNome}</p>
                              <p className="font-mono text-[11px] text-synk-indigo">{c.materialSku}</p>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[13px] font-semibold text-synk-navy">
                              {c.quantidade} <span className="text-[11px] font-normal text-[#94A3B8]">{c.unidade}</span>
                            </td>
                            <td className="w-8 px-1 py-2">
                              <button type="button"
                                onClick={() => setComponentes((prev) => prev.filter((x) => x.materialId !== c.materialId))}
                                className="flex size-7 items-center justify-center rounded text-[#94A3B8] hover:bg-[#fee2e2] hover:text-[#ef4444]">
                                <Trash2 className="size-3.5" strokeWidth={1.5} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {componentes.length === 0 && (
                  <p className="text-[12px] text-[#94A3B8]">Nenhuma matéria-prima adicionada — este produto não tem composição definida.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Resumo Financeiro ── */}
        {form.preco > 0 && (
          <ResumoFinanceiro
            preco={form.preco}
            precoCusto={form.precoCusto}
            componentes={componentes}
            todosProdutos={todosProdutos}
          />
        )}

        {/* ── Ativo ── */}
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-[#E2E8F0] p-3 transition-colors has-[:checked]:border-synk-indigo has-[:checked]:bg-synk-indigo-light/40">
          <Checkbox checked={form.ativo} onCheckedChange={(v) => set('ativo', v === true)}
            className="border-[#94A3B8] data-[state=checked]:border-synk-indigo data-[state=checked]:bg-synk-indigo" />
          <div>
            <p className="text-sm font-medium text-synk-navy">Produto ativo</p>
            <p className="text-xs text-[#94A3B8]">Produtos inativos não aparecem em pedidos</p>
          </div>
        </label>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">Cancelar</Button>
          <Button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 bg-synk-indigo hover:bg-synk-indigo-hover">
            {saving
              ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Salvando...</>
              : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function ResumoFinanceiro({
  preco, precoCusto, componentes, todosProdutos,
}: {
  preco: number
  precoCusto: number
  componentes: Componente[]
  todosProdutos: Produto[]
}) {
  // Custo estimado pela composição
  const custoComposicao = componentes.reduce((acc, c) => {
    const mat = todosProdutos.find((p) => p.id === c.materialId)
    return acc + (mat?.precoCusto ?? mat?.preco ?? 0) * c.quantidade
  }, 0)

  // Custo efetivo: preço de custo manual tem prioridade; senão usa composição
  const custoEfetivo = precoCusto > 0 ? precoCusto : custoComposicao

  const margem = preco > 0 && custoEfetivo > 0
    ? ((preco - custoEfetivo) / preco) * 100
    : null

  const margemColor = margem === null ? '#94A3B8'
    : margem < 0   ? '#ef4444'
    : margem < 20  ? '#f59e0b'
    : '#14b87e'

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Resumo Financeiro</p>
      <div className="grid grid-cols-3 gap-3">
        {/* Custo estimado (composição) */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] text-[#94A3B8]">Custo composição</p>
          <p className="font-mono text-[14px] font-bold text-synk-navy">
            {custoComposicao > 0 ? fmt(custoComposicao) : '—'}
          </p>
          {custoComposicao > 0 && componentes.length > 0 && (
            <p className="text-[10px] text-[#94A3B8]">{componentes.length} material{componentes.length !== 1 ? 'is' : ''}</p>
          )}
        </div>

        {/* Preço de venda */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] text-[#94A3B8]">Preço de venda</p>
          <p className="font-mono text-[14px] font-bold text-synk-navy">{fmt(preco)}</p>
        </div>

        {/* Margem de lucro */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[11px] text-[#94A3B8]">Margem de lucro</p>
          <p className="font-display text-[18px] font-bold" style={{ color: margemColor }}>
            {margem !== null ? `${margem.toFixed(1)}%` : '—'}
          </p>
          {margem !== null && (
            <p className="text-[10px]" style={{ color: margemColor }}>
              {margem < 0 ? 'Prejuízo' : margem < 20 ? 'Margem baixa' : margem < 40 ? 'Saudável' : 'Excelente'}
            </p>
          )}
        </div>
      </div>

      {/* Aviso de custo manual vs composição */}
      {precoCusto > 0 && custoComposicao > 0 && Math.abs(precoCusto - custoComposicao) > 0.01 && (
        <p className="mt-2.5 text-[11px] text-[#94A3B8]">
          ℹ Custo manual ({fmt(precoCusto)}) difere do custo da composição ({fmt(custoComposicao)}).
          A margem usa o custo manual.
        </p>
      )}
    </div>
  )
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-synk-navy">
        {label}{required && <span className="ml-0.5 text-synk-danger">*</span>}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-synk-danger">
          <AlertCircle className="size-3.5" strokeWidth={1.5} />{error}
        </p>
      )}
    </div>
  )
}
