'use client'

import { useState } from 'react'
import { ArrowRight, Download, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { type Pedido, FORMAS_PAGAMENTO, formatBRL, formatDate } from './types'
import { imprimirPedidoPdf } from './pdf'
import { StatusBadge } from './status-badge'
import type { OrderDetail } from '@/app/actions/orders'

export function ModalDetalhePedido({
  pedido,
  onClose,
  onNovoPedido,
  onConvertToOrder,
  getDetail,
  entityCapital = 'Pedido',
  parceiroLabel = 'Cliente',
}: {
  pedido: Pedido | null
  onClose: () => void
  onNovoPedido: () => void
  onConvertToOrder?: () => Promise<void>
  getDetail: (id: string) => Promise<OrderDetail>
  entityCapital?: string
  parceiroLabel?: string
}) {
  const [gerandoPdf, setGerandoPdf] = useState(false)

  if (!pedido) return null

  async function gerarPDF() {
    if (!pedido || gerandoPdf) return
    // Abre a janela ainda no gesto do clique para não ser bloqueada pelo navegador
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write('<p style="font-family:sans-serif;color:#64748b;padding:32px">Gerando PDF…</p>')
    setGerandoPdf(true)
    try {
      const detail = await getDetail(pedido.id)
      imprimirPedidoPdf(win, {
        titulo: `${entityCapital} #${pedido.numero}`,
        status: pedido.status,
        parceiroLabel,
        parceiroNome: pedido.cliente,
        criadoEm: pedido.criadoEm,
        formaPagamento: pedido.formaPagamento,
        dataPagamento: pedido.dataPagamento,
        obs: pedido.obs,
        itens: detail.items.map((i) => ({
          nome: i.nome, sku: i.sku, tipo: i.tipo, qtd: i.qtd, preco: i.preco, desconto: i.desconto,
        })),
        descontoGlobal: detail.descontoGlobal ?? 0,
      })
    } catch {
      win.close()
      toast.error('Erro ao carregar os itens para o PDF')
    } finally {
      setGerandoPdf(false)
    }
  }

  return (
    <ModalWrapper open onClose={onClose} title={`${entityCapital} #${pedido.numero}`} width="max-w-md">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Status + data */}
        <div className="flex items-center gap-2">
          <StatusBadge status={pedido.status} />
          <span className="ml-auto text-[12px] text-[#94A3B8]">{formatDate(pedido.criadoEm)}</span>
        </div>

        {/* Cliente */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">{parceiroLabel}</p>
          <p className="mt-0.5 text-[14px] font-semibold text-synk-navy">{pedido.cliente}</p>
        </div>

        {/* Pagamento */}
        {(pedido.formaPagamento || pedido.dataPagamento) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pedido.formaPagamento && (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Forma de pagamento</p>
                <p className="mt-0.5 text-[13px] font-semibold text-synk-navy">
                  {FORMAS_PAGAMENTO.find(f => f.value === pedido.formaPagamento)?.label ?? pedido.formaPagamento}
                </p>
              </div>
            )}
            {pedido.dataPagamento && (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Data de pagamento</p>
                <p className="mt-0.5 text-[13px] font-semibold text-synk-navy">{formatDate(pedido.dataPagamento)}</p>
              </div>
            )}
          </div>
        )}

        {/* Obs */}
        {pedido.obs && (
          <div className="rounded-lg border border-[#f59e0b40] bg-[#FEF3C7] p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Observações</p>
            <p className="mt-0.5 text-[13px] text-synk-navy">{pedido.obs}</p>
          </div>
        )}

        {/* Grid itens / subtotal / desconto */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Itens</p>
            <p className="mt-0.5 font-display text-[18px] font-bold text-synk-navy">{pedido.itens}</p>
          </div>
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Subtotal</p>
            <p className="mt-0.5 font-mono text-[13px] font-semibold text-synk-navy">{formatBRL(pedido.subtotal)}</p>
          </div>
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Desconto</p>
            <p className={`mt-0.5 font-mono text-[13px] font-semibold ${pedido.desconto > 0 ? 'text-[#ef4444]' : 'text-[#94A3B8]'}`}>
              {pedido.desconto > 0 ? `-${formatBRL(pedido.desconto)}` : '—'}
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg border border-synk-indigo/20 bg-synk-indigo-light p-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Total</p>
          <p className="mt-1 font-display text-[22px] font-bold text-synk-indigo">{formatBRL(pedido.total)}</p>
        </div>

        {/* Botões */}
        <div className="flex gap-2 border-t border-[#F1F5F9] pt-4">
          <button
            type="button"
            onClick={gerarPDF}
            disabled={gerandoPdf}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white py-2.5 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F8F9FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {gerandoPdf ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" strokeWidth={1.5} />}Gerar PDF
          </button>

          {onConvertToOrder && pedido.status === 'aprovado' ? (
            <button
              type="button"
              onClick={onConvertToOrder}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-md bg-[#14b87e] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0ea068]"
            >
              <ArrowRight className="size-3.5" strokeWidth={2} />Converter em Pedido
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); onNovoPedido() }}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-md bg-synk-indigo py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-synk-indigo-hover"
            >
              <Plus className="size-3.5" strokeWidth={2} />Novo pedido
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}
