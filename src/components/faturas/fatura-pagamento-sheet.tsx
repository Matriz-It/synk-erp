'use client'

import { useEffect, useState } from 'react'
import { Payment } from '@mercadopago/sdk-react'
import { Copy, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ensureMpInitialized } from '@/lib/mercadopago'
import { listFaturasAction, pagarFaturaAction, type PagamentoResult } from '@/app/actions/faturas'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { type Fatura, formatBRL, formatDate } from './types'

interface PaymentBrickSubmitData {
  paymentType: string
  formData: {
    token?: string
    issuer_id?: string | number
    payment_method_id: string
    installments?: number
    payer?: { email?: string; identification?: { type?: string; number?: string } }
  }
}

/**
 * O Payment Brick (script carregado do MP em runtime) manda `paymentType` em
 * snake_case (ex.: "credit_card"), diferente do que os types do sdk-react
 * declaram (camelCase). O backend só aceita os valores camelCase abaixo.
 */
const PAYMENT_TYPE_MAP: Record<string, 'creditCard' | 'debitCard' | 'ticket' | 'bank_transfer'> = {
  credit_card: 'creditCard',
  creditCard: 'creditCard',
  debit_card: 'debitCard',
  debitCard: 'debitCard',
  ticket: 'ticket',
  bank_transfer: 'bank_transfer',
}

export function FaturaPagamentoSheet({
  fatura, email, onClose, onPago,
}: {
  fatura: Fatura | null
  email: string
  onClose: () => void
  onPago: (fatura: Fatura) => void
}) {
  const [resultado, setResultado] = useState<PagamentoResult | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [verificando, setVerificando] = useState(false)

  useEffect(() => {
    if (fatura) {
      ensureMpInitialized()
      setResultado(null)
    }
  }, [fatura])

  async function handleSubmit(data: PaymentBrickSubmitData) {
    if (!fatura) return
    const paymentType = PAYMENT_TYPE_MAP[data.paymentType]
    if (!paymentType) {
      toast.error('Meio de pagamento não suportado')
      return
    }
    setEnviando(true)
    try {
      const res = await pagarFaturaAction(fatura.id, {
        paymentType,
        paymentMethodId: data.formData.payment_method_id,
        token: data.formData.token,
        installments: data.formData.installments,
        issuerId: data.formData.issuer_id !== undefined ? Number(data.formData.issuer_id) : undefined,
        payerEmail: data.formData.payer?.email || email,
        payerIdentification: data.formData.payer?.identification?.number
          ? {
              type: data.formData.payer.identification.type ?? 'CPF',
              number: data.formData.payer.identification.number,
            }
          : undefined,
      })
      setResultado(res)
      if (res.status === 'approved') {
        toast.success('Pagamento aprovado!')
        onPago(res.fatura)
      } else if (res.status === 'rejected') {
        toast.error(res.statusDetail || 'Pagamento recusado — tente outro método.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setEnviando(false)
    }
  }

  async function atualizarStatus() {
    if (!fatura) return
    setVerificando(true)
    try {
      const todas = await listFaturasAction()
      const atualizada = todas.find((f) => f.id === fatura.id)
      if (atualizada?.status === 'pago') {
        toast.success('Pagamento confirmado!')
        onPago(atualizada)
      } else {
        toast.info('Ainda não confirmamos o pagamento. Tente novamente em instantes.')
      }
    } catch {
      toast.error('Erro ao verificar status')
    } finally {
      setVerificando(false)
    }
  }

  return (
    <Dialog open={!!fatura} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        {fatura && (
          <>
            <DialogHeader>
              <DialogTitle>Pagar fatura #{fatura.numero}</DialogTitle>
              <DialogDescription>
                {formatBRL(fatura.valor)} — vencimento em {formatDate(fatura.vencimento)}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto px-4 pb-4">
              {resultado?.pix ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-4">
                  <p className="text-[13px] font-semibold text-synk-navy">Pague com PIX</p>
                  {resultado.pix.qrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${resultado.pix.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="size-48 rounded-md border border-[#E2E8F0]"
                    />
                  )}
                  <div className="flex w-full items-center gap-2">
                    <input
                      readOnly
                      value={resultado.pix.qrCode}
                      className="h-9 flex-1 truncate rounded-md border border-[#E2E8F0] bg-white px-2 font-mono text-[11px] text-[#64748B]"
                    />
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(resultado.pix!.qrCode); toast.success('Código copiado!') }}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
                      aria-label="Copiar código PIX"
                    >
                      <Copy className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={atualizarStatus}
                    disabled={verificando}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-synk-indigo text-[13px] font-semibold text-white hover:bg-synk-indigo-hover disabled:opacity-60"
                  >
                    {verificando ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" strokeWidth={1.5} />}
                    Já paguei, atualizar
                  </button>
                </div>
              ) : resultado?.boleto ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-4">
                  <p className="text-[13px] font-semibold text-synk-navy">Pague com boleto</p>
                  {resultado.boleto.digitableLine && (
                    <p className="w-full break-all rounded-md border border-[#E2E8F0] bg-white p-2 text-center font-mono text-[12px] text-[#334155]">
                      {resultado.boleto.digitableLine}
                    </p>
                  )}
                  {resultado.boleto.url && (
                    <a
                      href={resultado.boleto.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-full items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[13px] font-semibold text-synk-navy hover:bg-[#F1F5F9]"
                    >
                      Ver boleto
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={atualizarStatus}
                    disabled={verificando}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-synk-indigo text-[13px] font-semibold text-white hover:bg-synk-indigo-hover disabled:opacity-60"
                  >
                    {verificando ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" strokeWidth={1.5} />}
                    Já paguei, atualizar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {enviando && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/70 text-[13px] font-medium text-synk-navy">
                      <Loader2 className="size-4 animate-spin" />Processando...
                    </div>
                  )}
                  <Payment
                    initialization={{ amount: fatura.valor, payer: { email } }}
                    customization={{ paymentMethods: {
                      creditCard: 'all', debitCard: 'all', ticket: 'all', bankTransfer: ['pix'],
                    } }}
                    onSubmit={(param) => handleSubmit(param as unknown as PaymentBrickSubmitData)}
                    onError={(err) => toast.error(err.message || 'Erro no pagamento')}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
