'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import type { Servico } from './types'

interface FormState {
  nome: string
  codigo: string
  descricao: string
  preco: number
  precoCusto: number
  ativo: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

function validate(form: FormState, existingCodigos: string[], editCodigo?: string): FormErrors {
  const e: FormErrors = {}
  if (!form.nome.trim()) e.nome = 'Informe o nome do serviço'
  const codigo = form.codigo.toUpperCase().trim()
  if (!codigo) {
    e.codigo = 'Informe o código'
  } else if (codigo !== editCodigo && existingCodigos.includes(codigo)) {
    e.codigo = 'Código já cadastrado'
  }
  if (form.preco <= 0) e.preco = 'Informe um preço válido'
  return e
}

const EMPTY_FORM: FormState = {
  nome: '', codigo: '', descricao: '', preco: 0, precoCusto: 0, ativo: true,
}

// Montar condicionalmente ({modalForm && <ModalFormServico/>}) — o formulário
// inicializa a partir de servicoEdicao na montagem e zera ao desmontar.
export function ModalFormServico({
  open,
  onClose,
  onSave,
  existingCodigos,
  servicoEdicao,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Servico, 'id' | 'criadoEm'>) => Promise<Servico>
  existingCodigos: string[]
  servicoEdicao: Servico | null
}) {
  const isEditing = !!servicoEdicao

  const [form, setForm] = useState<FormState>(() =>
    servicoEdicao
      ? {
          nome: servicoEdicao.nome,
          codigo: servicoEdicao.codigo,
          descricao: servicoEdicao.descricao ?? '',
          preco: servicoEdicao.preco,
          precoCusto: servicoEdicao.precoCusto ?? 0,
          ativo: servicoEdicao.ativo,
        }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form, existingCodigos, servicoEdicao?.codigo)
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setSaving(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        codigo: form.codigo.toUpperCase().trim(),
        descricao: form.descricao.trim() || null,
        preco: form.preco,
        precoCusto: form.precoCusto > 0 ? form.precoCusto : null,
        ativo: form.ativo,
      })
      onClose()
    } catch {
      // toast de erro exibido pela view — mantém modal aberto
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title={isEditing ? 'Editar serviço' : 'Novo serviço'} width="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
          <div className="space-y-1.5">
            <Label htmlFor="servico-nome" className="text-[13px] font-medium text-synk-navy">Nome do serviço</Label>
            <Input
              id="servico-nome"
              placeholder="Ex: Instalação elétrica"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              maxLength={150}
              autoFocus
            />
            {errors.nome && <p className="text-[11px] text-synk-danger">{errors.nome}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="servico-codigo" className="text-[13px] font-medium text-synk-navy">Código</Label>
            <Input
              id="servico-codigo"
              placeholder="SRV-001"
              value={form.codigo}
              onChange={(e) => set('codigo', e.target.value.toUpperCase())}
              maxLength={50}
              className="font-mono"
            />
            {errors.codigo && <p className="text-[11px] text-synk-danger">{errors.codigo}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="servico-descricao" className="text-[13px] font-medium text-synk-navy">
            Descrição <span className="font-normal text-[#94A3B8]">(opcional)</span>
          </Label>
          <textarea
            id="servico-descricao"
            rows={3}
            placeholder="Detalhes do serviço, escopo, materiais inclusos..."
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            className="w-full resize-none rounded-md border border-[#E2E8F0] p-3 text-[13px] text-synk-navy placeholder:text-[#94A3B8] focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="servico-preco" className="text-[13px] font-medium text-synk-navy">Preço de venda</Label>
            <CurrencyInput id="servico-preco" value={form.preco} onChange={(v) => set('preco', v)} error={!!errors.preco} />
            {errors.preco && <p className="text-[11px] text-synk-danger">{errors.preco}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="servico-custo" className="text-[13px] font-medium text-synk-navy">
              Custo <span className="font-normal text-[#94A3B8]">(opcional)</span>
            </Label>
            <CurrencyInput id="servico-custo" value={form.precoCusto} onChange={(v) => set('precoCusto', v)} />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={form.ativo} onCheckedChange={(v) => set('ativo', v === true)} />
          <span className="text-[13px] font-medium text-synk-navy">Serviço ativo</span>
        </label>

        <div className="flex gap-3 border-t border-[#F1F5F9] pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">Cancelar</Button>
          <Button type="submit" disabled={saving} className="flex-[2] bg-synk-indigo hover:bg-synk-indigo-hover">
            {saving
              ? <><Loader2 className="size-4 animate-spin" />Salvando...</>
              : isEditing ? 'Salvar alterações' : 'Cadastrar serviço'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
