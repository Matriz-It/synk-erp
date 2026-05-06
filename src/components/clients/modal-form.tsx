'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AlertCircle, Check, Loader2, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import {
  type Cliente, UFs,
  maskCPF, maskCNPJ, maskCEP, maskTelefone,
} from './types'

interface ClienteForm {
  tipo: 'PJ' | 'PF'
  razaoSocial: string
  nomeFantasia: string
  documento: string
  telefone: string
  email: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  ativo: boolean
}

type FormErrors = Partial<Record<keyof ClienteForm, string>>

const EMPTY_FORM: ClienteForm = {
  tipo: 'PJ', razaoSocial: '', nomeFantasia: '', documento: '',
  telefone: '', email: '', cep: '', logradouro: '', numero: '',
  complemento: '', bairro: '', cidade: '', uf: 'SP', ativo: true,
}

function validate(form: ClienteForm): FormErrors {
  const e: FormErrors = {}
  if (!form.razaoSocial.trim())
    e.razaoSocial = form.tipo === 'PF' ? 'Nome completo obrigatório' : 'Razão social obrigatória'
  const docDigits = form.documento.replace(/\D/g, '')
  if (!docDigits)
    e.documento = form.tipo === 'PF' ? 'CPF obrigatório' : 'CNPJ obrigatório'
  else if (form.tipo === 'PF' && docDigits.length !== 11) e.documento = 'CPF inválido'
  else if (form.tipo === 'PJ' && docDigits.length !== 14) e.documento = 'CNPJ inválido'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
  const cepD = form.cep.replace(/\D/g, '')
  if (!cepD) e.cep = 'CEP obrigatório'
  else if (cepD.length !== 8) e.cep = 'CEP inválido'
  if (!form.logradouro.trim()) e.logradouro = 'Logradouro obrigatório'
  if (!form.numero.trim()) e.numero = 'Número obrigatório'
  if (!form.cidade.trim()) e.cidade = 'Cidade obrigatória'
  return e
}

export function ModalClienteForm({
  open, onClose, onSave, clienteEdicao,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Cliente, 'id' | 'criadoEm' | 'totalPedidos' | 'totalGasto'>) => Promise<void>
  clienteEdicao: Cliente | null
}) {
  const isEditing = !!clienteEdicao
  const [form, setForm] = useState<ClienteForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [cepError, setCepError] = useState('')

  useEffect(() => {
    if (!open) return
    if (clienteEdicao) {
      setForm({
        tipo: clienteEdicao.tipo, razaoSocial: clienteEdicao.razaoSocial,
        nomeFantasia: clienteEdicao.nomeFantasia, documento: clienteEdicao.documento,
        telefone: clienteEdicao.telefone, email: clienteEdicao.email,
        cep: clienteEdicao.cep, logradouro: clienteEdicao.logradouro,
        numero: clienteEdicao.numero, complemento: clienteEdicao.complemento,
        bairro: clienteEdicao.bairro, cidade: clienteEdicao.cidade,
        uf: clienteEdicao.uf, ativo: clienteEdicao.ativo,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
    setCepError('')
  }, [open, clienteEdicao])

  function set<K extends keyof ClienteForm>(key: K, value: ClienteForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleTipoChange(tipo: 'PJ' | 'PF') {
    setForm((f) => ({ ...f, tipo, documento: '' }))
    setErrors((e) => ({ ...e, documento: undefined, tipo: undefined }))
  }

  async function fetchCEP(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setLoadingCep(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) { setCepError('CEP não encontrado.'); return }
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        uf: data.uf || f.uf,
      }))
      setErrors((e) => ({ ...e, logradouro: undefined, cidade: undefined, cep: undefined }))
    } catch {
      setCepError('Erro ao buscar CEP. Verifique sua conexão.')
    } finally {
      setLoadingCep(false)
    }
  }

  async function handleSubmit() {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    try {
      await onSave({
        tipo: form.tipo, razaoSocial: form.razaoSocial.trim(),
        nomeFantasia: form.nomeFantasia.trim(), documento: form.documento,
        telefone: form.telefone, email: form.email.trim(),
        cep: form.cep, logradouro: form.logradouro.trim(),
        numero: form.numero.trim(), complemento: form.complemento.trim(),
        bairro: form.bairro.trim(), cidade: form.cidade.trim(),
        uf: form.uf, ativo: form.ativo,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title={isEditing ? 'Editar Cliente' : 'Novo Cliente'} width="max-w-2xl">
      <div className="space-y-5 p-6">

        {/* Tipo tabs */}
        <div className="flex overflow-hidden rounded-lg border border-[#E2E8F0]">
          {(['PJ', 'PF'] as const).map((t, i) => {
            const isActive = form.tipo === t
            const isInactive = !isActive
            return (
              <button
                key={t}
                type="button"
                disabled={isEditing}
                onClick={() => !isEditing && handleTipoChange(t)}
                title={isEditing && isInactive ? 'Tipo do cliente não pode ser alterado após o cadastro' : undefined}
                className={[
                  'flex-1 py-2.5 text-[13px] font-semibold transition-colors',
                  i === 0 ? 'border-r border-[#E2E8F0]' : '',
                  isActive
                    ? 'bg-synk-indigo text-white'
                    : isEditing
                      ? 'cursor-not-allowed bg-[#F1F5F9] text-[#CBD5E1]'
                      : 'bg-white text-[#64748B] hover:bg-[#F8F9FC]',
                ].join(' ')}
              >
                {t === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </button>
            )
          })}
        </div>
        {isEditing && (
          <p className="mt-1 text-[11px] text-[#94A3B8]">
            O tipo do cliente (PJ/PF) não pode ser alterado após o cadastro.
          </p>
        )}

        {/* Dados principais */}
        <F label={form.tipo === 'PF' ? 'Nome completo *' : 'Razão social *'} error={errors.razaoSocial}>
          <Input
            placeholder={form.tipo === 'PF' ? 'Maria da Silva' : 'Empresa Ltda'}
            value={form.razaoSocial}
            onChange={(e) => set('razaoSocial', e.target.value)}
            className={err(errors.razaoSocial)}
          />
        </F>

        <div className="grid grid-cols-2 gap-4">
          {form.tipo === 'PJ' && (
            <F label="Nome fantasia">
              <Input placeholder="Nome comercial" value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} />
            </F>
          )}
          <F label={`${form.tipo === 'PF' ? 'CPF' : 'CNPJ'} *`} error={errors.documento}>
            <Input
              placeholder={form.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={form.documento}
              inputMode="numeric"
              onChange={(e) => set('documento', form.tipo === 'PF' ? maskCPF(e.target.value) : maskCNPJ(e.target.value))}
              className={`font-mono ${err(errors.documento)}`}
            />
          </F>
          <F label="Telefone">
            <Input
              placeholder="(11) 99999-9999"
              value={form.telefone}
              inputMode="tel"
              onChange={(e) => set('telefone', maskTelefone(e.target.value))}
              className="font-mono"
            />
          </F>
        </div>

        <F label="E-mail" error={errors.email}>
          <Input
            type="email"
            placeholder={form.tipo === 'PF' ? 'maria@email.com' : 'financeiro@empresa.com.br'}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={err(errors.email)}
          />
        </F>

        {/* Divisor endereço */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Endereço</span>
          <span className="h-px flex-1 bg-[#E2E8F0]" />
        </div>

        {/* Endereço */}
        <div className="grid grid-cols-3 gap-4">
          <F label="CEP *" error={errors.cep || cepError}>
            <div className="relative">
              <Input
                placeholder="00000-000"
                value={form.cep}
                inputMode="numeric"
                onChange={(e) => { set('cep', maskCEP(e.target.value)); setCepError('') }}
                onBlur={(e) => fetchCEP(e.target.value)}
                className={`font-mono ${err(errors.cep || cepError)} ${loadingCep ? 'pr-9' : ''}`}
              />
              {loadingCep && <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#94A3B8]" strokeWidth={1.5} />}
            </div>
            {!errors.cep && !cepError && <p className="mt-1 text-[11px] text-[#94A3B8]">Preenchimento automático</p>}
          </F>
          <div className="col-span-2">
            <F label="Logradouro *" error={errors.logradouro}>
              <Input placeholder="Av. Paulista" value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)} className={err(errors.logradouro)} />
            </F>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <F label="Número *" error={errors.numero}>
            <Input placeholder="1000" value={form.numero} onChange={(e) => set('numero', e.target.value)} className={err(errors.numero)} />
          </F>
          <F label="Complemento opt.">
            <Input placeholder="Sala, apto, bloco..." value={form.complemento} onChange={(e) => set('complemento', e.target.value)} />
          </F>
          <F label="Bairro">
            <Input placeholder="Centro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />
          </F>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <F label="UF">
            <select
              value={form.uf}
              onChange={(e) => set('uf', e.target.value)}
              className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
            >
              {UFs.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </F>
          <div className="col-span-2">
            <F label="Cidade *" error={errors.cidade}>
              <Input placeholder="São Paulo" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} className={err(errors.cidade)} />
            </F>
          </div>
        </div>

        {/* Ativo */}
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-[#E2E8F0] p-3 transition-colors has-[:checked]:border-synk-indigo has-[:checked]:bg-synk-indigo-light/40">
          <Checkbox
            checked={form.ativo}
            onCheckedChange={(v) => set('ativo', v === true)}
            className="border-[#94A3B8] data-[state=checked]:border-synk-indigo data-[state=checked]:bg-synk-indigo"
          />
          <div>
            <p className="text-sm font-medium text-synk-navy">Cliente ativo</p>
            <p className="text-xs text-[#94A3B8]">Clientes inativos não aparecem em novos pedidos</p>
          </div>
        </label>

        {/* Botões */}
        <div className="flex gap-3 border-t border-[#F1F5F9] pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving} className="flex-[2] bg-synk-indigo hover:bg-synk-indigo-hover">
            {saving
              ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Salvando...</>
              : <><Check className="size-4" strokeWidth={2} />{isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}</>}
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
      {error && (
        <p className="flex items-center gap-1.5 text-[12px] text-synk-danger">
          <AlertCircle className="size-3" strokeWidth={1.5} />{error}
        </p>
      )}
    </div>
  )
}

function err(e?: string) {
  return e ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''
}
