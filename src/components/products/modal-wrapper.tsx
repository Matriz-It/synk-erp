'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function ModalWrapper({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className={`relative z-10 flex w-full ${width} max-h-[85vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-xl`}>
        <div className="flex shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="font-display text-[15px] font-bold text-synk-navy sm:text-[17px]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-synk-navy"
            aria-label="Fechar"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
