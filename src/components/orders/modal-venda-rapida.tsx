'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2, Minus, Plus, Search, Trash2, Zap } from 'lucide-react'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatBRL } from './types'
import type { Cliente } from '@/components/clients/types'
import type { Produto } from '@/components/products/types'
import type { OrderSavePayload } from './pedidos-view'

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro',       label: 'Dinheiro' },
  { value: 'pix',            label: 'PIX' },
  { value: 'cartao_debito',  label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'boleto',         label: 'Boleto' },
]

interface ItemVenda {
  prodId: string
  nome: string
  sku: string
  preco: number
  qtd: number
}

interface Props {
  open: boolean
  onClose: () => void
  clientes: Cliente[]
  produtos: Produto[]
  onConcluir: (payload: OrderSavePayload) => Promise<void>
}

export function ModalVendaRapida({ open, onClose, clientes, produtos, onConcluir }: Props) {
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [buscaProd, setBuscaProd] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSel, setClienteSel] = useState<Cliente | null>(null)
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [salvando, setSalvando] = useState(false)

  const prodsFiltrados = useMemo(() => {
    if (!buscaProd) return []
    const q = buscaProd.toLowerCase()
    return produtos
      .filter((p) => p.ativo && p.qtd > 0 && (p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)))
      .slice(0, 6)
  }, [produtos, buscaProd])

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return []
    const q = buscaCliente.toLowerCase()
    return clientes
      .filter((c) => c.ativo && (c.razaoSocial.toLowerCase().includes(q) || c.documento.includes(buscaCliente.replace(/\D/g, ''))))
      .slice(0, 5)
  }, [clientes, buscaCliente])

  const total = useMemo(() => itens.reduce((s, i) => s + i.preco * i.qtd, 0), [itens])

  function addItem(prod: Produto) {
    setItens((prev) => {
      const existing = prev.find((i) => i.prodId === prod.id)
      if (existing) return prev.map((i) => i.prodId === prod.id ? { ...i, qtd: i.qtd + 1 } : i)
      return [...prev, { prodId: prod.id, nome: prod.nome, sku: prod.sku, preco: prod.preco, qtd: 1 }]
    })
    setBuscaProd('')
  }

  function updateQtd(prodId: string, delta: number) {
    setItens((prev) => prev
      .map((i) => i.prodId === prodId ? { ...i, qtd: Math.max(1, i.qtd + delta) } : i)
    )
  }

  function removeItem(prodId: string) {
    setItens((prev) => prev.filter((i) => i.prodId !== prodId))
  }

  function reset() {
    setItens([])
    setBuscaProd('')
    setBuscaCliente('')
    setClienteSel(null)
    setFormaPagamento('dinheiro')
  }

  async function handleConcluir() {
    if (itens.length === 0) { toast.error('Adicione ao menos 1 produto'); return }
    if (!formaPagamento) { toast.error('Selecione a forma de pagamento'); return }

    setSalvando(true)
    try {
      await onConcluir({
        clientId: clienteSel?.id ?? '',
        status: 'concluido',
        obs: '',
        descontoGlobal: 0,
        formaPagamento,
        dataPagamento: new Date().toISOString().split('T')[0],
        pago: true,
        items: itens.map((i) => ({
          prodId: i.prodId,
          nome: i.nome,
          sku: i.sku,
          preco: i.preco,
          qtd: i.qtd,
          maxQtd: 9999,
          desconto: '',
        })),
      })
      toast.success(`Venda concluída! Total: ${formatBRL(total)}`)
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao concluir venda')
    } finally {
      setSalvando(false)
    }
  }

  function handleClose() { reset(); onClose() }

  return (
    <ModalWrapper open={open} onClose={handleClose} title="Venda Rápida" width="max-w-lg">
      <div className="flex flex-col gap-5 p-4 sm:p-6">

        {/* Busca de produto */}
        <div className="flex flex-col gap-1.5">
          <Label>Produto</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
            <Input
              placeholder="Buscar produto por nome ou SKU..."
              value={buscaProd}
              onChange={(e) => setBuscaProd(e.target.value)}
              className="h-10 pl-9"
              autoComplete="off"
            />
          </div>

          {prodsFiltrados.length > 0 && (
            <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-md">
              {prodsFiltrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem(p)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F8F9FC]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-medium text-synk-navy">{p.nome}</p>
                    <p className="font-mono text-[11px] text-[#94A3B8]">{p.sku} · {p.qtd} em estoque</p>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-synk-indigo">{formatBRL(p.preco)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de itens */}
        {itens.length > 0 && (
          <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Produto</th>
                  <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Qtd</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {itens.map((item, i) => (
                  <tr key={item.prodId} className={i < itens.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
                    <td className="px-3 py-2.5">
                      <p className="text-[13px] font-medium text-synk-navy">{item.nome}</p>
                      <p className="font-mono text-[11px] text-[#94A3B8]">{formatBRL(item.preco)} / un</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" onClick={() => updateQtd(item.prodId, -1)}
                          className="flex size-6 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]">
                          <Minus className="size-3" strokeWidth={2} />
                        </button>
                        <span className="w-7 text-center font-mono text-[13px] font-semibold">{item.qtd}</span>
                        <button type="button" onClick={() => updateQtd(item.prodId, 1)}
                          className="flex size-6 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]">
                          <Plus className="size-3" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[13px] font-bold text-synk-navy">
                      {formatBRL(item.preco * item.qtd)}
                    </td>
                    <td className="px-2 py-2.5">
                      <button type="button" onClick={() => removeItem(item.prodId)}
                        className="flex size-7 items-center justify-center rounded text-[#94A3B8] transition-colors hover:bg-[#fee2e2] hover:text-[#ef4444]">
                        <Trash2 className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Forma de pagamento */}
        <div className="flex flex-col gap-1.5">
          <Label>Forma de pagamento</Label>
          <div className="flex flex-wrap gap-2">
            {FORMAS_PAGAMENTO.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormaPagamento(f.value)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  formaPagamento === f.value
                    ? 'border-synk-indigo bg-synk-indigo-light text-synk-indigo'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-synk-indigo/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cliente (opcional) */}
        <div className="flex flex-col gap-1.5">
          <Label>
            Cliente <span className="font-normal text-[#94A3B8]">(opcional — deixe em branco para Consumidor Final)</span>
          </Label>
          {clienteSel ? (
            <div className="flex items-center justify-between rounded-lg border border-synk-indigo bg-synk-indigo-light px-3 py-2">
              <div>
                <p className="text-[13px] font-semibold text-synk-navy">{clienteSel.razaoSocial}</p>
                <p className="text-[11px] text-[#94A3B8]">{clienteSel.documento}</p>
              </div>
              <button type="button" onClick={() => { setClienteSel(null); setBuscaCliente('') }}
                className="text-[11px] font-medium text-synk-indigo hover:underline">
                remover
              </button>
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Buscar cliente..."
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                className="h-9"
              />
              {clientesFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 rounded-lg border border-[#E2E8F0] bg-white shadow-md">
                  {clientesFiltrados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setClienteSel(c); setBuscaCliente('') }}
                      className="flex w-full flex-col px-4 py-2.5 text-left transition-colors hover:bg-[#F8F9FC]"
                    >
                      <span className="text-[13px] font-medium text-synk-navy">{c.razaoSocial}</span>
                      <span className="text-[11px] text-[#94A3B8]">{c.documento}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total + botão */}
        <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8F9FC] px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Total</p>
            <p className="font-display text-2xl font-bold text-synk-navy">{formatBRL(total)}</p>
            {clienteSel && (
              <p className="text-[11px] text-[#64748B]">{clienteSel.razaoSocial}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleConcluir}
            disabled={salvando || itens.length === 0}
            className="flex items-center gap-2 rounded-xl bg-[#14b87e] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#0ea068] disabled:opacity-50"
          >
            {salvando
              ? <><Loader2 className="size-4 animate-spin" />Concluindo...</>
              : <><Zap className="size-4" strokeWidth={2} />Concluir Venda</>}
          </button>
        </div>

      </div>
    </ModalWrapper>
  )
}
