import { type StatusPedido, STATUS_CFG } from './types'

export function StatusBadge({ status }: { status: StatusPedido }) {
  const cfg = STATUS_CFG[status]
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
