'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { type Conta, formatBRL, formatDate } from './types'

export function ModalBaixa({
  open, onClose, conta, onConfirm, titulo,
}: {
  open: boolean
  onClose: () => void
  conta: Conta | null
  onConfirm: (id: string, pagoEm: string, valorPago: number) => Promise<void>
  titulo: string
}) {
  const [pagoEm, setPagoEm] = useState(new Date().toISOString().split('T')[0])
  const [valorPago, setValorPago] = useState('')
  const [saving, setSaving] = useState(false)

  if (!conta) return null

  const valorFinal = parseFloat(valorPago.replace(',', '.')) || conta.valor

  async function handleConfirm() {
    setSaving(true)
    try {
      await onConfirm(conta!.id, pagoEm, valorFinal)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title={titulo} width="max-w-md">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Conta info */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Conta</p>
          <p className="mt-0.5 font-semibold text-synk-navy">{conta.parceiro}</p>
          <p className="text-[13px] text-[#64748B]">{conta.descricao}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12px] text-[#94A3B8]">Vencimento: {formatDate(conta.vencimento)}</span>
            <span className="font-display text-[18px] font-bold text-synk-indigo">{formatBRL(conta.valor)}</span>
          </div>
        </div>

        {/* Data e valor */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-synk-navy">Data da baixa</label>
            <input type="date" value={pagoEm} onChange={e => setPagoEm(e.target.value)}
              className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-synk-navy">Valor pago</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#94A3B8]">R$</span>
              <input
                placeholder={conta.valor.toFixed(2).replace('.', ',')}
                value={valorPago}
                onChange={e => setValorPago(e.target.value)}
                inputMode="decimal"
                className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white pl-9 pr-3 font-mono text-sm text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
              />
            </div>
            <p className="text-[11px] text-[#94A3B8]">Padrão: {formatBRL(conta.valor)}</p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#F1F5F9] pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">Cancelar</Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex flex-[2] items-center justify-center gap-2 rounded-md bg-[#14b87e] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0ea068] disabled:opacity-70"
          >
            {saving
              ? <><Loader2 className="size-4 animate-spin" />Registrando...</>
              : <><CheckCircle className="size-4" strokeWidth={1.5} />Confirmar baixa</>}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
