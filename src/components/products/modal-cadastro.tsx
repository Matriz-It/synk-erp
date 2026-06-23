'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AlertCircle, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ModalWrapper } from './modal-wrapper'
import { type Produto, CATEGORIAS } from './types'

interface FormState {
  nome: string
  sku: string
  categoria: string
  preco: number
  precoCusto: number
  qtdInicial: string
  ativo: boolean
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
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Produto, 'id' | 'criadoEm'> & { qtdInicial: number }) => Promise<void>
  existingSkus: string[]
  produtoEdicao: Produto | null
}) {
  const isEditing = !!produtoEdicao

  const [form, setForm] = useState<FormState>({
    nome: '', sku: '', categoria: 'alimentos', preco: 0, precoCusto: 0, qtdInicial: '', ativo: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (produtoEdicao) {
      setForm({
        nome: produtoEdicao.nome,
        sku: produtoEdicao.sku,
        categoria: produtoEdicao.categoria,
        preco: produtoEdicao.preco,
        precoCusto: produtoEdicao.precoCusto ?? 0,
        qtdInicial: '',
        ativo: produtoEdicao.ativo,
      })
    } else {
      setForm({ nome: '', sku: '', categoria: 'alimentos', preco: 0, precoCusto: 0, qtdInicial: '', ativo: true })
    }
    setErrors({})
  }, [open, produtoEdicao])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit() {
    const errs = validate(form, existingSkus, isEditing, produtoEdicao?.sku)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      await onSave({
        sku: form.sku.toUpperCase().trim(),
        nome: form.nome.trim(),
        categoria: form.categoria,
        preco: form.preco,
        precoCusto: form.precoCusto > 0 ? form.precoCusto : null,
        qtd: isEditing ? (produtoEdicao?.qtd ?? 0) : (parseInt(form.qtdInicial) || 0),
        qtdMin: produtoEdicao?.qtdMin ?? 10,
        ativo: form.ativo,
        foto: produtoEdicao?.foto ?? null,
        qtdInicial: parseInt(form.qtdInicial) || 0,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const categoriasOpts = CATEGORIAS.filter((c) => c.id !== 'all')

  return (
    <ModalWrapper open={open} onClose={onClose} title={isEditing ? 'Editar Produto' : 'Novo Produto'}>
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8F9FC]">
            <Package className="size-8 text-[#94A3B8]" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] text-[#94A3B8]">Foto opcional · JPG, PNG, WEBP · máx 2 MB</p>
        </div>

        <Field label="Nome do produto" error={errors.nome} required>
          <Input
            placeholder="Ex: Café Expresso 500g"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            className={errors.nome ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU" error={errors.sku} required>
            <Input
              placeholder="Ex: SKU-009"
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
              {categoriasOpts.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Preço de venda" error={errors.preco} required>
            <CurrencyInput
              value={form.preco}
              onChange={(v) => set('preco', v)}
              error={!!errors.preco}
            />
          </Field>
          <Field label="Preço de custo (fornecedor)">
            <CurrencyInput
              value={form.precoCusto}
              onChange={(v) => set('precoCusto', v)}
              placeholder="0,00 (opcional)"
            />
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

        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-[#E2E8F0] p-3 transition-colors has-[:checked]:border-synk-indigo has-[:checked]:bg-synk-indigo-light/40">
          <Checkbox
            checked={form.ativo}
            onCheckedChange={(v) => set('ativo', v === true)}
            className="border-[#94A3B8] data-[state=checked]:border-synk-indigo data-[state=checked]:bg-synk-indigo"
          />
          <div>
            <p className="text-sm font-medium text-synk-navy">Produto ativo</p>
            <p className="text-xs text-[#94A3B8]">Produtos inativos não aparecem em pedidos</p>
          </div>
        </label>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-synk-indigo hover:bg-synk-indigo-hover"
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Salvando...</>
            ) : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function Field({ label, error, required, children }: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
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
