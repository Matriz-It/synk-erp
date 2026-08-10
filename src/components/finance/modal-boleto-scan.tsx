'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AlertCircle, Camera, Check, Keyboard, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { parseBoletoAction } from '@/app/actions/bills'
import { BoletoScanner } from './boleto-scanner'
import { type Conta, formatBRL, formatDate } from './types'

type Step = 'scan' | 'manual' | 'confirm'

interface ParsedBoleto {
  codigoBarras: string
  banco: string
  bancoNome: string
  valor: number
  vencimento: string | null
}

interface ConfirmForm {
  parceiro: string
  descricao: string
  vencimento: string
  categoria: string
  obs: string
}

type FormErrors = Partial<Record<keyof ConfirmForm, string>>

function validate(f: ConfirmForm): FormErrors {
  const e: FormErrors = {}
  if (!f.parceiro.trim()) e.parceiro = 'Informe o nome'
  if (!f.descricao.trim()) e.descricao = 'Informe a descrição'
  if (!f.vencimento) e.vencimento = 'Informe o vencimento'
  return e
}

export function ModalBoletoScan({
  open, onClose, onSave, parceiroLabel, categorias,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Conta, 'id' | 'numero' | 'status' | 'criadoEm'>) => Promise<void>
  parceiroLabel: string
  categorias: readonly { value: string; label: string }[]
}) {
  const [step, setStep] = useState<Step>('scan')
  const [scanAttempt, setScanAttempt] = useState(0)
  const [manualCode, setManualCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedBoleto | null>(null)
  const [form, setForm] = useState<ConfirmForm>({ parceiro: '', descricao: '', vencimento: '', categoria: categorias[0]?.value ?? '', obs: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('scan')
    setScanAttempt(a => a + 1)
    setManualCode('')
    setScanError(null)
    setParsed(null)
    setChecking(false)
    setForm({ parceiro: '', descricao: '', vencimento: '', categoria: categorias[0]?.value ?? '', obs: '' })
    setErrors({})
  }, [open, categorias])

  function set<K extends keyof ConfirmForm>(key: K, value: ConfirmForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function rescan() {
    setStep('scan')
    setScanAttempt(a => a + 1)
    setScanError(null)
    setParsed(null)
  }

  async function handleCode(codigo: string) {
    setScanError(null)
    setChecking(true)
    try {
      const res = await parseBoletoAction(codigo)
      if (res.duplicado) {
        setScanError('Este boleto já foi cadastrado.')
        setScanAttempt(a => a + 1)
        return
      }
      setParsed(res)
      setForm(f => ({ ...f, vencimento: res.vencimento ?? '' }))
      setStep('confirm')
    } catch {
      setScanError('Código ilegível, tente novamente.')
      setScanAttempt(a => a + 1)
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit() {
    if (!parsed) return
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    try {
      await onSave({
        parceiro: form.parceiro.trim(),
        descricao: form.descricao.trim(),
        valor: parsed.valor,
        vencimento: form.vencimento,
        categoria: form.categoria,
        obs: form.obs.trim(),
        codigoBarras: parsed.codigoBarras,
        banco: parsed.banco,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Escanear boleto">
      <div className="space-y-4 p-4 sm:p-6">
        {step !== 'confirm' && (
          <>
            {step === 'scan' ? (
              <BoletoScanner key={scanAttempt} onDetected={handleCode} />
            ) : (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-synk-navy">Código de barras (44 dígitos)</Label>
                <Input
                  inputMode="numeric"
                  placeholder="00000000000000000000000000000000000000000000"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 44))}
                  className="font-mono"
                />
              </div>
            )}

            {checking && (
              <p className="flex items-center gap-2 text-[13px] text-[#64748B]"><Loader2 className="size-3.5 animate-spin" />Lendo boleto...</p>
            )}
            {scanError && (
              <p className="flex items-center gap-1.5 text-[13px] text-synk-danger"><AlertCircle className="size-3.5" strokeWidth={1.5} />{scanError}</p>
            )}

            <p className="text-[12px] text-[#94A3B8]">
              {step === 'scan'
                ? 'Aponte a câmera para o código de barras do boleto, alinhado à faixa.'
                : 'Digite os 44 dígitos do código de barras impresso no boleto.'}
            </p>

            <div className="flex gap-3 border-t border-[#F1F5F9] pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              {step === 'scan' ? (
                <Button type="button" variant="outline" onClick={() => { setStep('manual'); setScanError(null) }} className="flex-1">
                  <Keyboard className="size-4" strokeWidth={1.5} />Digitar código
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={rescan} className="flex-1">
                    <Camera className="size-4" strokeWidth={1.5} />Usar câmera
                  </Button>
                  <Button type="button" onClick={() => handleCode(manualCode)} disabled={manualCode.length !== 44 || checking} className="flex-1 bg-synk-indigo hover:bg-synk-indigo-hover">
                    Verificar
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {step === 'confirm' && parsed && (
          <>
            <div className="rounded-md border border-[#E2E8F0] bg-[#F8F9FC] p-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">{parsed.bancoNome}</span>
                <span className="font-mono font-bold text-synk-navy">{formatBRL(parsed.valor)}</span>
              </div>
              {parsed.vencimento && (
                <p className="mt-0.5 text-[12px] text-[#94A3B8]">Vencimento identificado: {formatDate(parsed.vencimento)}</p>
              )}
            </div>

            <F label={`${parceiroLabel} *`} error={errors.parceiro}>
              <Input placeholder="Nome" value={form.parceiro} onChange={e => set('parceiro', e.target.value)} className={err(errors.parceiro)} />
            </F>
            <F label="Descrição *" error={errors.descricao}>
              <Input placeholder="Ex: NF 1234, Aluguel maio..." value={form.descricao} onChange={e => set('descricao', e.target.value)} className={err(errors.descricao)} />
            </F>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="Valor">
                <CurrencyInput value={parsed.valor} onChange={() => {}} disabled />
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
              <Button type="button" variant="outline" onClick={rescan} disabled={saving} className="flex-1">
                <RotateCcw className="size-4" strokeWidth={1.5} />Escanear outro
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={saving} className="flex-[2] bg-synk-indigo hover:bg-synk-indigo-hover">
                {saving ? <><Loader2 className="size-4 animate-spin" />Salvando...</> : <><Check className="size-4" strokeWidth={2} />Cadastrar</>}
              </Button>
            </div>
          </>
        )}
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
