import { cn } from "@/lib/utils"

export type StatusKind =
  | "pago"
  | "vencendo"
  | "vencido"
  | "aberto"
  | "rascunho"
  | "aprovado"

const STYLES: Record<StatusKind, { label: string; bg: string; text: string; dot: string }> = {
  pago: { label: "Pago", bg: "bg-synk-success-bg", text: "text-synk-success", dot: "bg-synk-success" },
  vencendo: { label: "Vencendo", bg: "bg-synk-warning-bg", text: "text-synk-warning", dot: "bg-synk-warning" },
  vencido: { label: "Vencido", bg: "bg-synk-danger-bg", text: "text-synk-danger", dot: "bg-synk-danger" },
  aberto: { label: "Em aberto", bg: "bg-synk-info-bg", text: "text-synk-info", dot: "bg-synk-info" },
  rascunho: { label: "Rascunho", bg: "bg-[#F1F5F9]", text: "text-[#64748B]", dot: "bg-[#94A3B8]" },
  aprovado: { label: "Aprovado", bg: "bg-synk-success-bg", text: "text-synk-success", dot: "bg-synk-success" },
}

export function StatusBadge({ status }: { status: StatusKind }) {
  const style = STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-semibold",
        style.bg,
        style.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  )
}
