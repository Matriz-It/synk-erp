'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/products/modal-wrapper'
import type { Employee } from '@/app/actions/employees'

const ROLE_LABEL: Record<string, string> = {
  proprietario: 'Proprietário',
  admin: 'Administrador',
  financeiro: 'Financeiro',
  vendedor: 'Vendedor',
}

interface Props {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function ModalConfirmRemove({ open, employee, onClose, onConfirm }: Props) {
  const [removing, setRemoving] = useState(false)

  if (!employee) return null

  async function handleConfirm() {
    setRemoving(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Remover funcionário" width="max-w-md">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Alert */}
        <div className="flex gap-3.5 rounded-[10px] border border-[#ef444430] bg-[#FEE2E2] p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ef4444]">
            <AlertTriangle className="size-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#ef4444]">Remover funcionário permanentemente?</p>
            <p className="mt-1 text-[13px] text-[#374151]">
              Esta ação não pode ser desfeita. O acesso do funcionário será revogado imediatamente.
            </p>
          </div>
        </div>

        {/* Employee info */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-3.5">
          <p className="text-[12px] text-[#94A3B8]">Funcionário a ser removido</p>
          <p className="mt-0.5 text-[14px] font-semibold text-synk-navy">{employee.name}</p>
          <p className="text-[12px] text-[#64748B]">{employee.email}</p>
          <p className="mt-1 text-[12px] text-[#94A3B8]">
            Função: <span className="font-medium text-synk-navy">{ROLE_LABEL[employee.role] ?? employee.role}</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={removing}
            className="flex-1"
          >
            Cancelar
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={removing}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#ef4444] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#dc2626] disabled:opacity-80"
          >
            {removing
              ? <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Removendo...</>
              : 'Sim, remover'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
