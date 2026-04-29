import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { StatusBadge, type StatusKind } from "@/components/dashboard/status-badge"

interface Receivable {
  order: string
  client: string
  value: number
  dueDate: string
  status: StatusKind
}

const ROWS: Receivable[] = [
  { order: "#1042", client: "Lima Distribuidora", value: 4120, dueDate: "12/04/2026", status: "vencido" },
  { order: "#1056", client: "Padaria São Jorge", value: 850, dueDate: "29/04/2026", status: "vencendo" },
  { order: "#1063", client: "Construtora Velez", value: 12300, dueDate: "30/04/2026", status: "vencendo" },
  { order: "#1071", client: "Mercado Boa Vista", value: 2475, dueDate: "05/05/2026", status: "aberto" },
  { order: "#1024", client: "Loja do João", value: 1980, dueDate: "21/04/2026", status: "pago" },
  { order: "#1080", client: "Café Central", value: 640, dueDate: "08/05/2026", status: "rascunho" },
]

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

export function ReceivablesTable() {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <header className="flex flex-col gap-1 border-b border-[#F1F5F9] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-synk-navy">Contas a Receber</h2>
          <p className="text-[13px] text-[#64748B]">Pedidos com vencimento próximo ou em atraso.</p>
        </div>
        <Link href="/dashboard/financeiro/receber" className="inline-flex items-center gap-1 text-[13px] font-semibold text-synk-indigo hover:text-synk-indigo-hover">
          Ver todos
          <ArrowRight className="size-3.5" strokeWidth={1.5} />
        </Link>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[#F8F9FC] text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              <th className="px-5 py-3">Pedido</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3 text-right">Valor</th>
              <th className="px-5 py-3">Vencimento</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.order} className="border-t border-[#F1F5F9] transition-colors hover:bg-[#F8F9FC]">
                <td className="px-5 py-3 font-mono text-[13px] font-medium text-synk-indigo">{row.order}</td>
                <td className="px-5 py-3 font-medium text-synk-navy">{row.client}</td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-synk-navy">{formatBRL(row.value)}</td>
                <td className="px-5 py-3 font-mono text-[#334155]">{row.dueDate}</td>
                <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
