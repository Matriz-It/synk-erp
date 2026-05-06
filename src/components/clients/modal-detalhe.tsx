'use client'

import { Settings, Trash2 } from 'lucide-react'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { type Cliente, formatBRL, formatDate } from './types'

export function ModalClienteDetalhe({
  open, onClose, cliente, onEditar, onExcluir,
}: {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
  onEditar: () => void
  onExcluir: () => void
}) {
  if (!cliente) return null

  const isPJ = cliente.tipo === 'PJ'

  return (
    <ModalWrapper open={open} onClose={onClose} title={cliente.razaoSocial} width="max-w-xl">
      <div className="space-y-5 p-6">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-bold ${isPJ ? 'bg-synk-indigo-light text-synk-indigo' : 'bg-[#d1fae5] text-[#14b87e]'}`}>
            {cliente.tipo}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${cliente.ativo ? 'bg-[#d1fae5] text-[#14b87e]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
            <span className={`size-[5px] rounded-full ${cliente.ativo ? 'bg-[#14b87e]' : 'bg-[#94A3B8]'}`} />
            {cliente.ativo ? 'Ativo' : 'Inativo'}
          </span>
          <span className="ml-auto text-[12px] text-[#94A3B8]">Cliente desde {formatDate(cliente.criadoEm)}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Total em pedidos</p>
            <p className="mt-1 font-display text-[18px] font-bold text-synk-navy">{cliente.totalPedidos} pedido{cliente.totalPedidos !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-lg border border-synk-indigo/10 bg-synk-indigo-light p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">Total gasto</p>
            <p className="mt-1 font-display text-[18px] font-bold text-synk-indigo">{formatBRL(cliente.totalGasto)}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-4">
          <Detail label={isPJ ? 'CNPJ' : 'CPF'} value={cliente.documento} mono />
          <Detail label="Telefone" value={cliente.telefone || '—'} mono />
          <Detail label="E-mail" value={cliente.email || '—'} span />
          <Detail label="Endereço" value={`${cliente.logradouro}, ${cliente.numero}${cliente.complemento ? `, ${cliente.complemento}` : ''} — ${cliente.bairro}`} span />
          <Detail label="Cidade / UF" value={`${cliente.cidade} / ${cliente.uf}`} />
          <Detail label="CEP" value={cliente.cep} mono />
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-[#F1F5F9] pt-4">
          <Button type="button" onClick={onEditar} className="flex-[2] bg-synk-indigo text-[13px] hover:bg-synk-indigo-hover">
            <Settings className="size-3.5" strokeWidth={1.5} />Editar cliente
          </Button>
          <button
            type="button"
            onClick={onExcluir}
            className="flex flex-1 items-center justify-center rounded-md border border-[#ef444440] bg-[#fee2e2] px-3 py-2 text-[13px] font-semibold text-[#ef4444] transition-colors hover:border-[#ef4444] hover:bg-[#ef4444] hover:text-white"
          >
            Excluir
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function Detail({ label, value, mono, span }: { label: string; value: string; mono?: boolean; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">{label}</p>
      <p className={`mt-0.5 break-all text-[13px] text-synk-navy ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function Button({ type, onClick, children, className }: { type: 'button'; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button type={type} onClick={onClick} className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${className ?? ''}`}>
      {children}
    </button>
  )
}
