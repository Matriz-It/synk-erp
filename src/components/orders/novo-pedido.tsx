'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle, ArrowLeft, Check, Download, FileText, Loader2,
  Package, Plus, Search, Trash2, X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Cliente } from '@/components/clients/types'
import type { Produto } from '@/components/products/types'
import {
  type PedidoItem, type StatusPedido,
  STATUS_CFG, formatBRL,
} from './types'
import type { OrderViewConfig } from './pedidos-view'
import type { OrderDetail } from '@/app/actions/orders'
import { StatusBadge } from './status-badge'
import { FORMAS_PAGAMENTO } from './types'

const DEFAULT_FORM_CONFIG: OrderViewConfig = {
  title: 'Pedidos de Venda',
  entity: 'pedido',
  entityPlural: 'pedidos',
  entityCapital: 'Pedido',
  novoLabel: 'Novo pedido',
  confirmarLabel: 'Confirmar pedido',
}

const ALL_STATUS_OPTS: StatusPedido[] = ['rascunho', 'pendente', 'aprovado', 'cancelado', 'entregue']

export function NovoPedido({
  onVoltar,
  onSalvar,
  proximoNumero,
  clientes,
  produtos,
  config: cfg = DEFAULT_FORM_CONFIG,
  initialOrder,
}: {
  onVoltar: () => void
  onSalvar: (data: { clientId: string; status: StatusPedido; obs: string; descontoGlobal: number; formaPagamento: string; dataPagamento: string; items: PedidoItem[] }) => Promise<void>
  proximoNumero: number
  clientes: Cliente[]
  produtos: Produto[]
  config?: OrderViewConfig
  initialOrder?: OrderDetail
}) {
  const [status, setStatus] = useState<StatusPedido>(initialOrder?.status ?? 'rascunho')
  const [clienteSel, setClienteSel] = useState<Cliente | null>(() =>
    initialOrder ? (clientes.find((c) => c.id === initialOrder.clienteId) ?? null) : null
  )
  const [buscaCliente, setBuscaCliente] = useState('')
  const [showClientes, setShowClientes] = useState(false)
  const [buscaProd, setBuscaProd] = useState('')
  const [itens, setItens] = useState<PedidoItem[]>(() =>
    initialOrder
      ? initialOrder.items.map((i) => ({
          prodId: i.productId,
          nome: i.nome,
          sku: i.sku,
          preco: i.preco,
          qtd: i.qtd,
          desconto: i.desconto > 0 ? String(i.desconto) : '',
          maxQtd: produtos.find((p) => p.id === i.productId)?.qtd ?? i.qtd,
        }))
      : []
  )
  const [descontoGlobal, setDescontoGlobal] = useState(
    initialOrder?.descontoGlobal ? String(initialOrder.descontoGlobal) : ''
  )
  const [obs, setObs] = useState(initialOrder?.obs ?? '')
  const [formaPagamento, setFormaPagamento] = useState(initialOrder?.formaPagamento ?? '')
  const [dataPagamento, setDataPagamento] = useState(
    initialOrder?.dataPagamento ?? new Date().toISOString().split('T')[0]
  )
  const [salvando, setSalvando] = useState(false)

  const clienteRef = useRef<HTMLDivElement>(null)
  const prodRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (clienteRef.current && !clienteRef.current.contains(e.target as Node)) setShowClientes(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const clientesFiltrados = clientes.filter(
    (c) => c.ativo && (!buscaCliente || c.razaoSocial.toLowerCase().includes(buscaCliente.toLowerCase()) || c.documento.includes(buscaCliente))
  ).slice(0, 6)

  const prodsFiltrados = produtos.filter(
    (p) => p.ativo && p.qtd > 0 && (!buscaProd || p.nome.toLowerCase().includes(buscaProd.toLowerCase()) || p.sku.toLowerCase().includes(buscaProd.toLowerCase()))
  )

  function addItem(prod: Produto) {
    setItens((prev) => {
      if (prev.find((i) => i.prodId === prod.id)) return prev
      return [...prev, { prodId: prod.id, nome: prod.nome, sku: prod.sku, preco: prod.preco, qtd: 1, maxQtd: prod.qtd, desconto: '' }]
    })
    setBuscaProd('')
  }

  function updateQtd(prodId: string, delta: number) {
    setItens((prev) => prev.map((i) => {
      if (i.prodId !== prodId) return i
      const next = Math.max(1, Math.min(i.qtd + delta, i.maxQtd))
      return { ...i, qtd: next }
    }))
  }

  function updateDesconto(prodId: string, val: string) {
    setItens((prev) => prev.map((i) => i.prodId === prodId ? { ...i, desconto: val } : i))
  }

  function removeItem(prodId: string) {
    setItens((prev) => prev.filter((i) => i.prodId !== prodId))
  }

  const isEditingExisting = !!initialOrder
  const isEditingPendentePedido = isEditingExisting && initialOrder?.status === 'pendente' && cfg.showNFe
  const isEditingQuote = isEditingExisting && !cfg.showNFe

  const subtotalItens = itens.reduce((acc, i) => acc + i.preco * i.qtd - (parseFloat(i.desconto) || 0), 0)
  const descGlobal = parseFloat(descontoGlobal) || 0
  const total = Math.max(0, subtotalItens - descGlobal)
  const descontosItem = itens.reduce((acc, i) => acc + (parseFloat(i.desconto) || 0), 0)
  const canConfirm = !!clienteSel && itens.length > 0

  async function salvar(finalStatus: StatusPedido) {
    if (!clienteSel || itens.length === 0) return
    setSalvando(true)
    try {
      await onSalvar({
        clientId: clienteSel.id,
        status: finalStatus,
        obs,
        descontoGlobal: descGlobal,
        formaPagamento,
        dataPagamento,
        items: itens,
      })
    } finally {
      setSalvando(false)
    }
  }

  function gerarPDF() {
    if (!clienteSel || itens.length === 0) return
    const win = window.open('', '_blank')
    if (!win) return
    const cfg = STATUS_CFG[status]
    win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${cfg.entityCapital} #${proximoNumero}</title>
    <style>body{font-family:sans-serif;padding:32px;color:#0f172a}.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:4px;background:${cfg.bg};color:${cfg.color};font-size:12px;font-weight:600}.dot{width:6px;height:6px;border-radius:50%;background:${cfg.dot};display:inline-block}.row{display:flex;justify-content:space-between;padding:5px 0;font-size:14px}.footer{margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}</style>
    </head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h2 style="margin:0">${cfg.entityCapital} #${proximoNumero}</h2><span class="badge"><span class="dot"></span>${cfg.label}</span></div>
    <div style="background:#f8f9fc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:16px"><div style="font-size:11px;color:#94a3b8;margin-bottom:4px">CLIENTE</div><div style="font-weight:600">${clienteSel.razaoSocial}</div></div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px"><thead><tr style="background:#f8f9fc"><th style="text-align:left;padding:8px 12px;font-size:11px;color:#64748b">Produto</th><th style="text-align:right;padding:8px 12px;font-size:11px;color:#64748b">Qtd</th><th style="text-align:right;padding:8px 12px;font-size:11px;color:#64748b">Unit.</th><th style="text-align:right;padding:8px 12px;font-size:11px;color:#64748b">Total</th></tr></thead><tbody>
    ${itens.map((i) => `<tr style="border-top:1px solid #f1f5f9"><td style="padding:8px 12px">${i.nome}</td><td style="padding:8px 12px;text-align:right">${i.qtd}</td><td style="padding:8px 12px;text-align:right;font-family:monospace">${formatBRL(i.preco)}</td><td style="padding:8px 12px;text-align:right;font-family:monospace">${formatBRL(i.preco * i.qtd - (parseFloat(i.desconto) || 0))}</td></tr>`).join('')}
    </tbody></table>
    <div class="row"><span>Subtotal</span><span style="font-family:monospace">${formatBRL(subtotalItens + descontosItem)}</span></div>
    ${descontosItem + descGlobal > 0 ? `<div class="row"><span>Descontos</span><span style="color:#ef4444;font-family:monospace">-${formatBRL(descontosItem + descGlobal)}</span></div>` : ''}
    <div class="row" style="border-top:1px solid #e2e8f0;margin-top:8px;padding-top:12px"><span style="font-weight:700;font-size:16px">Total</span><span style="font-weight:700;font-size:18px;color:#3d3ebf;font-family:monospace">${formatBRL(total)}</span></div>
    ${obs ? `<div style="margin-top:16px;background:#fef3c7;padding:12px;border-radius:8px"><div style="font-size:11px;color:#94a3b8;margin-bottom:4px">OBSERVAÇÕES</div><div>${obs}</div></div>` : ''}
    <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} · Synk ERP</div>
    </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onVoltar} className="flex size-9 items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:bg-[#F1F5F9]">
          <ArrowLeft className="size-4" strokeWidth={1.5} />
        </button>
        <span className="rounded-md bg-[#F1F5F9] px-3 py-1.5 font-mono text-[13px] font-semibold text-synk-indigo">
          {cfg.entityCapital} #{initialOrder?.numero ?? proximoNumero}
        </span>
        <div className="ml-auto flex gap-2">
          {isEditingPendentePedido ? (
            // Pedido pendente → Gerar NF-e
            <button
              type="button"
              onClick={async () => {
                await salvar(status)
                toast.info('Geração de NF-e em breve — módulo fiscal em desenvolvimento.')
              }}
              disabled={!canConfirm || salvando}
              className="flex h-9 items-center gap-1.5 rounded-md bg-[#14b87e] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0ea068] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> : <FileText className="size-3.5" strokeWidth={1.5} />}
              Gerar NF-e
            </button>
          ) : isEditingQuote ? (
            // Edição de orçamento → só Salvar
            <button
              type="button"
              onClick={() => salvar(status)}
              disabled={!canConfirm || salvando}
              className="flex h-9 items-center gap-1.5 rounded-md bg-synk-indigo px-4 text-[13px] font-semibold text-white transition-colors hover:bg-synk-indigo-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> : <Check className="size-3.5" strokeWidth={2.5} />}
              Salvar alterações
            </button>
          ) : (
            // Criação (novo pedido ou novo orçamento)
            <>
              <button type="button" onClick={gerarPDF} disabled={!canConfirm} className="flex h-9 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F8F9FC] disabled:cursor-not-allowed disabled:opacity-50">
                <Download className="size-3.5" strokeWidth={1.5} />PDF
              </button>
              <button type="button" onClick={() => salvar('rascunho')} disabled={!canConfirm || salvando} className="flex h-9 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F8F9FC] disabled:cursor-not-allowed disabled:opacity-50">
                {salvando ? <Loader2 className="size-3.5 animate-spin" /> : null}Salvar rascunho
              </button>
              <button type="button" onClick={() => salvar(status === 'rascunho' ? 'pendente' : status)} disabled={!canConfirm || salvando} className="flex h-9 items-center gap-1.5 rounded-md bg-synk-indigo px-4 text-[13px] font-semibold text-white transition-colors hover:bg-synk-indigo-hover disabled:cursor-not-allowed disabled:opacity-60">
                {salvando ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} /> : <Check className="size-3.5" strokeWidth={2.5} />}
                {cfg.confirmarLabel}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="flex flex-col gap-5">
          {/* Cliente */}
          <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-synk-navy">Cliente</h3>
            {clienteSel ? (
              <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${clienteSel.tipo === 'PJ' ? 'bg-synk-indigo-light text-synk-indigo' : 'bg-[#d1fae5] text-[#14b87e]'}`}>{clienteSel.tipo}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-synk-navy">{clienteSel.razaoSocial}</p>
                  <p className="font-mono text-[12px] text-[#64748B]">{clienteSel.documento} · {clienteSel.cidade}/{clienteSel.uf}</p>
                </div>
                <button type="button" onClick={() => setClienteSel(null)} className="rounded-md p-1 text-[#94A3B8] hover:text-synk-danger">
                  <X className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div ref={clienteRef} className="relative">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
                  <Input
                    placeholder="Buscar cliente por nome ou documento..."
                    value={buscaCliente}
                    onChange={(e) => { setBuscaCliente(e.target.value); setShowClientes(true) }}
                    onFocus={() => setShowClientes(true)}
                    className="h-9 pl-9 text-sm"
                  />
                </div>
                {showClientes && clientesFiltrados.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                    {clientesFiltrados.map((c) => (
                      <button key={c.id} type="button" onClick={() => { setClienteSel(c); setBuscaCliente(''); setShowClientes(false) }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F8F9FC]">
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${c.tipo === 'PJ' ? 'bg-synk-indigo-light text-synk-indigo' : 'bg-[#d1fae5] text-[#14b87e]'}`}>{c.tipo}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-synk-navy">{c.razaoSocial}</p>
                          <p className="font-mono text-[11px] text-[#94A3B8]">{c.documento}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Adicionar produtos */}
          <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-synk-navy">Adicionar produtos</h3>
            <div ref={prodRef} className="relative">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
                <Input placeholder="Buscar produto por nome ou SKU..." value={buscaProd} onChange={(e) => setBuscaProd(e.target.value)} className="h-9 pl-9 text-sm" />
              </div>
              {buscaProd && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-[200px] overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                  {prodsFiltrados.length === 0 ? (
                    <p className="px-4 py-3 text-[13px] text-[#94A3B8]">Nenhum produto encontrado</p>
                  ) : prodsFiltrados.map((p) => {
                    const inCart = itens.some((i) => i.prodId === p.id)
                    return (
                      <button key={p.id} type="button" onClick={() => addItem(p)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${inCart ? 'bg-synk-indigo-light' : 'hover:bg-[#F8F9FC]'}`}>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-synk-indigo-light">
                          <Package className="size-4 text-synk-indigo" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-synk-navy">{p.nome}</p>
                          <p className="font-mono text-[11px] text-[#94A3B8]">{p.sku} · {p.qtd} em estoque</p>
                        </div>
                        <span className="font-mono text-[13px] font-semibold text-synk-navy">{formatBRL(p.preco)}</span>
                        {inCart && <span className="text-[11px] font-semibold text-synk-indigo">adicionado ✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Itens */}
          {itens.length > 0 && (
            <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
              <div className="px-5 pt-5 pb-3">
                <h3 className="text-[13px] font-semibold text-synk-navy">Itens do pedido</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Produto</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Qtd</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Unit.</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Desc. R$</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Total</th>
                    <th className="w-10 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, i) => {
                    const rowTotal = item.preco * item.qtd - (parseFloat(item.desconto) || 0)
                    return (
                      <tr key={item.prodId} className={`${i < itens.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-synk-navy">{item.nome}</p>
                          <p className="font-mono text-[11px] text-synk-indigo">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => updateQtd(item.prodId, -1)} className="flex size-6 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]">−</button>
                            <span className="w-8 text-center font-mono text-[13px] font-semibold text-synk-navy">{item.qtd}</span>
                            <button type="button" onClick={() => updateQtd(item.prodId, 1)} disabled={item.qtd >= item.maxQtd} className="flex size-6 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40">+</button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] text-[#64748B]">{formatBRL(item.preco)}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number" min="0" step="0.01"
                            placeholder="0,00"
                            value={item.desconto}
                            onChange={(e) => updateDesconto(item.prodId, e.target.value)}
                            className="h-8 w-20 rounded border border-[#E2E8F0] px-2 text-right font-mono text-[12px] focus:border-synk-indigo focus:outline-none focus:ring-1 focus:ring-synk-indigo/20"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[13px] font-bold text-synk-navy">{formatBRL(rowTotal)}</td>
                        <td className="px-2 py-3">
                          <button type="button" onClick={() => removeItem(item.prodId)} className="flex size-7 items-center justify-center rounded border border-[#E2E8F0] text-[#94A3B8] transition-colors hover:border-synk-danger hover:bg-[#fee2e2] hover:text-synk-danger">
                            <Trash2 className="size-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          )}

          {/* Pagamento */}
          <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-synk-navy">Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-synk-navy">Forma de pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
                >
                  <option value="">Selecione...</option>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-synk-navy">Data de pagamento</label>
                <input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-synk-navy focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
                />
              </div>
            </div>
          </section>

          {/* Obs */}
          <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-synk-navy">Observações</h3>
            <textarea
              rows={3}
              placeholder="Instruções de entrega, condições especiais..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full resize-none rounded-md border border-[#E2E8F0] p-3 text-[13px] text-synk-navy placeholder:text-[#94A3B8] focus:border-synk-indigo focus:outline-none focus:ring-2 focus:ring-synk-indigo/15"
            />
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
          {/* Status */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
            <label className="mb-2 block text-[13px] font-semibold text-synk-navy">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusPedido)}
              className="h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 text-[13px] text-synk-navy focus:outline-none focus:ring-2 focus:ring-synk-indigo/20"
            >
              {ALL_STATUS_OPTS
                .filter((s) => !cfg.allowedStatuses || cfg.allowedStatuses.includes(s))
                .map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
            </select>
          </div>

          {/* Resumo */}
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h3 className="mb-4 text-[13px] font-semibold text-synk-navy">Resumo</h3>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal ({itens.length} iten{itens.length !== 1 ? 's' : ''})</span>
                <span className="font-mono">{formatBRL(subtotalItens + descontosItem)}</span>
              </div>
              {descontosItem > 0 && (
                <div className="flex justify-between text-[#ef4444]">
                  <span>Descontos por item</span>
                  <span className="font-mono">-{formatBRL(descontosItem)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Desconto geral</span>
                <input
                  type="number" min="0" step="0.01" placeholder="0,00"
                  value={descontoGlobal}
                  onChange={(e) => setDescontoGlobal(e.target.value)}
                  className="h-7 w-24 rounded border border-[#E2E8F0] px-2 text-right font-mono text-[12px] focus:border-synk-indigo focus:outline-none"
                />
              </div>
            </div>

            <div className="my-4 h-px bg-[#E2E8F0]" />

            <div className="flex justify-between">
              <span className="text-[15px] font-bold text-synk-navy">Total</span>
              <span className="font-display text-[22px] font-bold text-synk-indigo">{formatBRL(total)}</span>
            </div>

            {!clienteSel && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-[#FEF3C7] px-3 py-2.5 text-[12px] font-medium text-[#f59e0b]">
                <AlertTriangle className="size-3.5 shrink-0" strokeWidth={1.5} />Selecione um cliente
              </div>
            )}
            {itens.length === 0 && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-[#FEF3C7] px-3 py-2.5 text-[12px] font-medium text-[#f59e0b]">
                <AlertTriangle className="size-3.5 shrink-0" strokeWidth={1.5} />Adicione ao menos 1 produto
              </div>
            )}
          </div>

          {/* Itens preview */}
          {itens.length > 0 && (
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Itens</h3>
              <div className="space-y-2">
                {itens.map((i) => (
                  <div key={i.prodId} className="flex items-center justify-between text-[13px]">
                    <span className="text-[#64748B]"><span className="font-semibold text-synk-navy">{i.qtd}×</span> {i.nome}</span>
                    <span className="font-mono text-[12px] text-synk-navy">{formatBRL(i.preco * i.qtd)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
