'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalWrapper } from './modal-wrapper'
import { type Produto, type Movimentacao } from './types'

export function ModalMovimentacao({
  open,
  onClose,
  produto,
  onSave,
}: {
  open: boolean
  onClose: () => void
  produto: Produto | null
  onSave: (mov: Omit<Movimentacao, 'id' | 'operador'>) => Promise<void>
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [qtd, setQtd] = useState('')
  const [motivo, setMotivo] = useState('')
  const [errors, setErrors] = useState<{ qtd?: string; motivo?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setTipo('entrada'); setQtd(''); setMotivo(''); setErrors({}) }
  }, [open])

  if (!produto) return null

  const qtdNum = parseInt(qtd) || 0
  const saldoApos = tipo === 'entrada' ? produto.qtd + qtdNum : produto.qtd - qtdNum
  const showBalance = qtd.trim() !== '' && qtdNum > 0

  async function handleConfirm() {
    const errs: { qtd?: string; motivo?: string } = {}
    if (!qtd.trim() || qtdNum <= 0) {
      errs.qtd = 'Informe uma quantidade válida'
    } else if (tipo === 'saida' && produto && qtdNum > produto.qtd) {
      errs.qtd = `Quantidade superior ao estoque disponível (${produto.qtd} un.)`
    }
    if (!motivo.trim()) errs.motivo = 'Informe o motivo'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      await onSave({ tipo, qtd: qtdNum, motivo: motivo.trim(), data: new Date().toISOString().split('T')[0], saldoApos })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Movimentação de Estoque">
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-center gap-3 rounded-lg bg-[#F8F9FC] p-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-synk-indigo-light">
            <Package className="size-5 text-synk-indigo" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-synk-navy">{produto.nome}</p>
            <p className="text-xs text-[#64748B]">
              <span className="font-mono text-synk-indigo">{produto.sku}</span>
              {' · '}Estoque atual:{' '}
              <span className="font-mono font-semibold">{produto.qtd} un.</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-synk-navy">Tipo de movimentação</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['entrada', 'saida'] as const).map((t) => {
              const isActive = tipo === t
              const isEntrada = t === 'entrada'
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? isEntrada
                        ? 'border-[#14b87e] bg-[#d1fae5] text-[#14b87e]'
                        : 'border-[#ef4444] bg-[#fee2e2] text-[#ef4444]'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8F9FC]'
                  }`}
                >
                  {isEntrada
                    ? <ArrowDownRight className="size-4" strokeWidth={1.5} />
                    : <ArrowUpRight className="size-4" strokeWidth={1.5} />}
                  {isEntrada ? 'Entrada' : 'Saída'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-synk-navy">
            Quantidade <span className="text-synk-danger">*</span>
          </Label>
          <Input
            placeholder="0"
            value={qtd}
            onChange={(e) => { setQtd(e.target.value); setErrors((e2) => ({ ...e2, qtd: undefined })) }}
            className={`h-12 text-center font-mono text-lg font-semibold ${errors.qtd ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''}`}
            inputMode="numeric"
          />
          {errors.qtd && (
            <p className="flex items-center gap-1.5 text-xs text-synk-danger">
              <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.qtd}
            </p>
          )}
          {showBalance && (
            <div className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
              saldoApos < 0 ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#d1fae5] text-[#14b87e]'
            }`}>
              {saldoApos < 0
                ? <AlertTriangle className="size-4 shrink-0" strokeWidth={1.5} />
                : <Check className="size-4 shrink-0" strokeWidth={2} />}
              Saldo após movimentação:{' '}
              <span className="font-mono">{saldoApos} un.</span>
              {saldoApos < 0 && ' — insuficiente!'}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-synk-navy">
            Motivo <span className="text-synk-danger">*</span>
          </Label>
          <Input
            placeholder="Ex: Compra de fornecedor, Venda pedido #1090..."
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value); setErrors((e2) => ({ ...e2, motivo: undefined })) }}
            className={errors.motivo ? 'border-synk-danger focus-visible:ring-synk-danger/40' : ''}
          />
          {errors.motivo && (
            <p className="flex items-center gap-1.5 text-xs text-synk-danger">
              <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.motivo}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className={`flex-1 text-white ${tipo === 'entrada' ? 'bg-[#14b87e] hover:bg-[#0ea068]' : 'bg-[#ef4444] hover:bg-[#dc2626]'}`}
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Registrando...</>
            ) : tipo === 'entrada' ? (
              <><ArrowDownRight className="size-4" strokeWidth={1.5} />Confirmar entrada</>
            ) : (
              <><ArrowUpRight className="size-4" strokeWidth={1.5} />Confirmar saída</>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
