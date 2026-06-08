'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import { type Cliente } from './types'

export function ModalExcluirCliente({
  open, onClose, cliente, onConfirm, entityName = 'cliente',
}: {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
  onConfirm: () => Promise<void>
  entityName?: string
}) {
  const [deleting, setDeleting] = useState(false)

  if (!cliente) return null

  const entityCap = entityName.charAt(0).toUpperCase() + entityName.slice(1)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Confirmar exclusão" width="max-w-md">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Alert box */}
        <div className="flex gap-3.5 rounded-[10px] border border-[#ef444430] bg-[#FEE2E2] p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ef4444]">
            <AlertTriangle className="size-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#ef4444]">Excluir {entityName} permanentemente?</p>
            <p className="mt-1 text-[13px] text-[#374151]">
              Esta ação não pode ser desfeita. O {entityName} e seu histórico serão removidos.
            </p>
          </div>
        </div>

        {/* Client info */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3.5">
          <p className="text-[12px] text-[#94A3B8]">{entityCap} a ser excluído</p>
          <p className="mt-0.5 text-[14px] font-semibold text-synk-navy">{cliente.razaoSocial}</p>
          <p className="font-mono text-[12px] text-[#64748B]">{cliente.documento}</p>
          {cliente.totalPedidos > 0 && (
            <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#f59e0b]">
              <AlertTriangle className="size-3" strokeWidth={1.5} />
              Atenção: este {entityName} possui {cliente.totalPedidos} pedido(s) vinculado(s).
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={deleting} className="flex-1">
            Cancelar
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#ef4444] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#dc2626] disabled:opacity-80"
          >
            {deleting
              ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Excluindo...</>
              : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
