'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { ModalWrapper } from '@/components/products/modal-wrapper'

// Montar condicionalmente ({open && <ModalLancamento/>}) — o formulário
// zera ao desmontar, sem precisar de reset via effect.
export function ModalLancamento({
  open, onClose, onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (dto: { descricao: string; tipo: 'entrada' | 'saida'; valor: number }) => Promise<void>
}) {
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [valor, setValor] = useState(0)
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState(false)

  const descricaoInvalida = !descricao.trim()
  const valorInvalido = valor <= 0

  async function handleConfirm() {
    setTouched(true)
    if (descricaoInvalida || valorInvalido) return
    setSaving(true)
    try {
      await onConfirm({ descricao: descricao.trim(), tipo, valor })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Novo lançamento" width="max-w-md">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Título / motivo */}
        <div className="space-y-1.5">
          <label htmlFor="lancamento-descricao" className="text-[13px] font-medium text-synk-navy">Título</label>
          <Input
            id="lancamento-descricao"
            placeholder="Motivo/causa da movimentação"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            maxLength={200}
            autoFocus
          />
          {touched && descricaoInvalida && (
            <p className="text-[11px] text-synk-danger">Informe o motivo da movimentação</p>
          )}
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-medium text-synk-navy">Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`flex items-center justify-center gap-1.5 rounded-md border-[1.5px] py-2.5 text-[13px] font-semibold transition-colors ${tipo === 'entrada' ? 'border-[#14b87e] bg-[#d1fae5] text-[#14b87e]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#14b87e]/40'}`}
            >
              <ArrowDownRight className="size-4" strokeWidth={2} />Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('saida')}
              className={`flex items-center justify-center gap-1.5 rounded-md border-[1.5px] py-2.5 text-[13px] font-semibold transition-colors ${tipo === 'saida' ? 'border-[#ef4444] bg-[#fee2e2] text-[#ef4444]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#ef4444]/40'}`}
            >
              <ArrowUpRight className="size-4" strokeWidth={2} />Saída
            </button>
          </div>
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <label htmlFor="lancamento-valor" className="text-[13px] font-medium text-synk-navy">Valor</label>
          <CurrencyInput id="lancamento-valor" value={valor} onChange={setValor} error={touched && valorInvalido} />
          {touched && valorInvalido && (
            <p className="text-[11px] text-synk-danger">Informe um valor maior que zero</p>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#F1F5F9] pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">Cancelar</Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex flex-[2] items-center justify-center gap-2 rounded-md bg-synk-indigo py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-synk-indigo-hover disabled:opacity-70"
          >
            {saving
              ? <><Loader2 className="size-4 animate-spin" />Registrando...</>
              : <><CheckCircle className="size-4" strokeWidth={1.5} />Registrar</>}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
