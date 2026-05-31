'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { type Conta, formatBRL } from './types'

interface ContaForm {
  parceiro: string
  descricao: string
  valor: string
  vencimento: string
  categoria: string
  obs: string
}

type FormErrors = Partial<Record<keyof ContaForm, string>>

function validate(f: ContaForm): FormErrors {
  const e: FormErrors = {}
  if (!f.parceiro.trim()) e.parceiro = 'Informe o nome'
  if (!f.descricao.trim()) e.descricao = 'Informe a descrição'
  const v = parseFloat(f.valor.replace(',', '.'))
  if (!f.valor.trim() || isNaN(v) || v <= 0) e.valor = 'Informe um valor válido'
  if (!f.vencimento) e.vencimento = 'Informe o vencimento'
  return e
}

export function ModalContaForm({
  open, onClose, onSave, conta, parceiroLabel, categorias,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>) => Promise<void>
  conta: Conta | null
  parceiroLabel: string
  categorias: readonly { value: string; label: string }[]
}) {
  const isEditing = !!conta
  const [form, setForm] = useState<ContaForm>({
    parceiro: '', descricao: '', valor: '', vencimento: '', categoria: categorias[0]?.value ?? '', obs: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (conta) {
      setForm({
        parceiro: conta.parceiro,
        descricao: conta.descricao,
        valor: conta.valor.toFixed(2).replace('.', ','),
        vencimento: conta.vencimento,
        categoria: conta.categoria,
        obs: conta.obs,
      })
    } else {
      setForm({ parceiro: '', descricao: '', valor: '', vencimento: new Date().toISOString().split('T')[0], categoria: categorias[0]?.value ?? '', obs: '' })
    }
    setErrors({})
  }, [open, conta, categorias])

  function set<K extends keyof ContaForm>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit() {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    try {
      await onSave({
        parceiro: form.parceiro.trim(),
        descricao: form.descricao.trim(),
        valor: parseFloat(form.valor.replace(',', '.')),
        vencimento: form.vencimento,
        categoria: form.categoria,
        obs: form.obs.trim(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title={isEditing ? 'Editar conta' : 'Nova conta'}>
      <div className="space-y-4 p-6">
        <F label={`${parceiroLabel} *`} error={errors.parceiro}>
          <Input placeholder="Nome" value={form.parceiro} onChange={e => set('parceiro', e.target.value)} className={err(errors.parceiro)} />
        </F>
        <F label="Descrição *" error={errors.descricao}>
          <Input placeholder="Ex: NF 1234, Aluguel maio..." value={form.descricao} onChange={e => set('descricao', e.target.value)} className={err(errors.descricao)} />
        </F>
        <div className="grid grid-cols-2 gap-4">
          <F label="Valor *" error={errors.valor}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#94A3B8]">R$</span>
              <Input placeholder="0,00" value={form.valor} onChange={e => set('valor', e.target.value)} inputMode="decimal" className={`pl-9 font-mono ${err(errors.valor)}`} />
            </div>
          </F>
          <F label="Vencimento *" error={errors.vencimento}>
            <input type="date" value={form.vencimento} onChange={e => set('vencimento', e.target.value)}
              className={`h-10 w-full rounded-md border px-3 text-sm text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/20 ${errors.vencimento ? 'border-synk-danger' : 'border-[#E2E8F0]'}`} />
          </F>
        </div>
        <F label="Categoria">
          <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
            className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20">
            {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </F>
        <F label="Observação">
          <textarea rows={2} placeholder="Informações adicionais..." value={form.obs} onChange={e => set('obs', e.target.value)}
            className="w-full resize-none rounded-md border border-[#E2E8F0] p-3 text-[13px] text-synk-navy placeholder:text-[#94A3B8] focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/15" />
        </F>
        <div className="flex gap-3 border-t border-[#F1F5F9] pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">Cancelar</Button>
          <Button type="button" onClick={handleSubmit} disabled={saving} className="flex-[2] bg-synk-indigo hover:bg-synk-indigo-hover">
            {saving ? <><Loader2 className="size-4 animate-spin" />Salvando...</> : <><Check className="size-4" strokeWidth={2} />{isEditing ? 'Salvar alterações' : 'Cadastrar'}</>}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function F({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-synk-navy">{label}</Label>
      {children}
      {error && <p className="flex items-center gap-1.5 text-[12px] text-synk-danger"><AlertCircle className="size-3" strokeWidth={1.5} />{error}</p>}
    </div>
  )
}

function err(e?: string) { return e ? 'border-synk-danger focus-visible:ring-synk-danger/40' : '' }
