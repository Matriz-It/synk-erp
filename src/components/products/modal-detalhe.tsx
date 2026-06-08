'use client'

import { AlertTriangle, ArrowDownRight, ArrowUpRight, Loader2, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from './modal-wrapper'
import { type Produto, type Movimentacao, stockStatus, formatBRL, formatDate, CAT_LABEL } from './types'

export function ModalDetalhe({
  open,
  onClose,
  produto,
  movimentacoes,
  loadingMovs,
  onNovaMovimentacao,
  onEditar,
}: {
  open: boolean
  onClose: () => void
  produto: Produto | null
  movimentacoes: Movimentacao[]
  loadingMovs?: boolean
  onNovaMovimentacao: () => void
  onEditar: () => void
}) {
  if (!produto) return null
  const st = stockStatus(produto)
  const isLoadingMovs = loadingMovs ?? false

  return (
    <ModalWrapper open={open} onClose={onClose} title={produto.nome} width="max-w-2xl">
      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3">
          <InfoCard
            label="Estoque atual"
            value={`${produto.qtd} un.`}
            color={st === 'ok' ? '#14b87e' : '#ef4444'}
            bg={st === 'ok' ? '#d1fae5' : '#fee2e2'}
          />
          <InfoCard label="Preço de venda" value={formatBRL(produto.preco)} color="#0f172a" bg="#f8f9fc" />
          <InfoCard label="SKU" value={produto.sku} color="#3d3ebf" bg="#eef0ff" mono />
        </div>

        {st !== 'ok' && (
          <div className={`flex items-start gap-2.5 rounded-lg px-3.5 py-3 ${
            st === 'zero' ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#fef3c7] text-[#f59e0b]'
          }`}>
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            <p className="text-sm font-medium">
              {st === 'zero'
                ? 'Produto sem estoque — reponha imediatamente.'
                : `Estoque abaixo do mínimo (${produto.qtdMin} un.). Considere repor.`}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" onClick={onNovaMovimentacao} className="bg-synk-indigo hover:bg-synk-indigo-hover">
            <Plus className="size-4" strokeWidth={1.5} />
            Nova movimentação
          </Button>
          <Button type="button" variant="outline" onClick={onEditar}>
            <Settings className="size-4" strokeWidth={1.5} />
            Editar produto
          </Button>
        </div>

        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Histórico de movimentações
          </h3>
          {isLoadingMovs ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] py-8 text-[#94A3B8]">
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              <span className="text-sm">Carregando movimentações...</span>
            </div>
          ) : movimentacoes.length === 0 ? (
            <p className="rounded-lg border border-[#E2E8F0] py-8 text-center text-sm text-[#94A3B8]">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                    {['Tipo', 'Qtd', 'Motivo', 'Data', 'Saldo após'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] ${i === 1 || i === 4 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`transition-colors hover:bg-[#F8F9FC] ${i < movimentacoes.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          m.tipo === 'entrada' ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#fee2e2] text-[#ef4444]'
                        }`}>
                          {m.tipo === 'entrada'
                            ? <ArrowDownRight className="size-3" strokeWidth={2} />
                            : <ArrowUpRight className="size-3" strokeWidth={2} />}
                          {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-synk-navy">{m.qtd}</td>
                      <td className="px-4 py-3 text-[#64748B]">{m.motivo}</td>
                      <td className="px-4 py-3 text-[#64748B]">{formatDate(m.data)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-synk-navy">{m.saldoApos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 border-t border-[#E2E8F0] pt-4 text-[13px]">
          <MetaItem label="Categoria" value={CAT_LABEL[produto.categoria] ?? produto.categoria} />
          <MetaItem label="Criado em" value={formatDate(produto.criadoEm)} />
          <MetaItem
            label="Status"
            value={produto.ativo ? 'Ativo' : 'Inativo'}
            color={produto.ativo ? '#14b87e' : '#94a3b8'}
          />
        </div>
      </div>
    </ModalWrapper>
  )
}

function InfoCard({ label, value, color, bg, mono }: {
  label: string
  value: string
  color: string
  bg: string
  mono?: boolean
}) {
  return (
    <div className="rounded-lg p-3" style={{ background: bg }}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className={`mt-1 text-base font-bold ${mono ? 'font-mono' : 'font-display'}`} style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function MetaItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <span>
      <span className="text-[#94A3B8]">{label}: </span>
      <span className="font-medium" style={color ? { color } : undefined}>{value}</span>
    </span>
  )
}
