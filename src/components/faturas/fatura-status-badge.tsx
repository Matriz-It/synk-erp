import { type Fatura, STATUS_FATURA, computeDisplayStatus } from './types'

export function FaturaStatusBadge({ fatura }: { fatura: Fatura }) {
  const cfg = STATUS_FATURA[computeDisplayStatus(fatura)]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="size-[5px] rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}
