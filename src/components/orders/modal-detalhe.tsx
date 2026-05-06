'use client'

import { ArrowRight, Download, Plus } from 'lucide-react'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { type Pedido, FORMAS_PAGAMENTO, STATUS_CFG, formatBRL, formatDate } from './types'
import { StatusBadge } from './status-badge'

export function ModalDetalhePedido({
  pedido,
  onClose,
  onNovoPedido,
  onConvertToOrder,
}: {
  pedido: Pedido | null
  onClose: () => void
  onNovoPedido: () => void
  onConvertToOrder?: () => Promise<void>
}) {
  if (!pedido) return null

  function gerarPDF() {
    const win = window.open('', '_blank')
    if (!win) return
    const cfg = STATUS_CFG[pedido!.status]
    win.document.write(`
      <!DOCTYPE html><html lang="pt-BR"><head>
      <meta charset="UTF-8"><title>Pedido #${pedido!.numero}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 32px; color: #0f172a; }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        .badge { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:4px;
                 background:${cfg.bg}; color:${cfg.color}; font-size:12px; font-weight:600; }
        .dot { width:6px; height:6px; border-radius:50%; background:${cfg.dot}; display:inline-block; }
        .box { background:#f8f9fc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; margin-bottom:16px; }
        .row { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; }
        .total { font-size:20px; font-weight:700; color:#3d3ebf; }
        .footer { margin-top:32px; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:12px; }
      </style></head><body>
      <div class="header">
        <h2 style="margin:0;font-size:20px">Pedido #${pedido!.numero}</h2>
        <span class="badge"><span class="dot"></span>${cfg.label}</span>
      </div>
      <div class="box">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">CLIENTE</div>
        <div style="font-weight:600">${pedido!.cliente}</div>
      </div>
      ${pedido!.obs ? `<div class="box" style="background:#fef3c7;border-color:#f59e0b40"><div style="font-size:11px;color:#94a3b8;margin-bottom:4px">OBSERVAÇÕES</div><div>${pedido!.obs}</div></div>` : ''}
      <div class="row"><span>Subtotal (${pedido!.itens} iten${pedido!.itens !== 1 ? 's' : ''})</span><span>${formatBRL(pedido!.subtotal)}</span></div>
      ${pedido!.desconto > 0 ? `<div class="row"><span>Desconto</span><span style="color:#ef4444">-${formatBRL(pedido!.desconto)}</span></div>` : ''}
      <div class="row" style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:8px"><span style="font-weight:700">Total</span><span class="total">${formatBRL(pedido!.total)}</span></div>
      <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} · Synk ERP</div>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <ModalWrapper open onClose={onClose} title={`Pedido #${pedido.numero}`} width="max-w-md">
      <div className="space-y-4 p-6">
        {/* Status + data */}
        <div className="flex items-center gap-2">
          <StatusBadge status={pedido.status} />
          <span className="ml-auto text-[12px] text-[#94A3B8]">{formatDate(pedido.criadoEm)}</span>
        </div>

        {/* Cliente */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Cliente</p>
          <p className="mt-0.5 text-[14px] font-semibold text-synk-navy">{pedido.cliente}</p>
        </div>

        {/* Pagamento */}
        {(pedido.formaPagamento || pedido.dataPagamento) && (
          <div className="grid grid-cols-2 gap-3">
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
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white py-2.5 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F8F9FC]"
          >
            <Download className="size-3.5" strokeWidth={1.5} />Gerar PDF
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
