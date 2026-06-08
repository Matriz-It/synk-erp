import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { StatusBadge, type StatusKind } from "@/components/dashboard/status-badge"

export interface ReceivableRow {
  order:   string
  client:  string
  value:   number
  dueDate: string
  status:  StatusKind
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export function ReceivablesTable({ rows }: { rows: ReceivableRow[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <header className="flex flex-col gap-1 border-b border-[#F1F5F9] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-synk-navy">Contas a Receber</h2>
          <p className="text-[13px] text-[#64748B]">Recebíveis com vencimento próximo ou em atraso.</p>
        </div>
        <Link href="/dashboard/financeiro/receber" className="inline-flex items-center gap-1 text-[13px] font-semibold text-synk-indigo hover:text-synk-indigo-hover">
          Ver todos <ArrowRight className="size-3.5" strokeWidth={1.5} />
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-[#94A3B8]">
          Nenhuma conta a receber pendente
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#F8F9FC] text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                <th className="px-5 py-3">Número</th>
                <th className="px-5 py-3">Cliente / Origem</th>
                <th className="px-5 py-3 text-right">Valor</th>
                <th className="px-5 py-3">Vencimento</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${row.order}-${i}`} className="border-t border-[#F1F5F9] transition-colors hover:bg-[#F8F9FC]">
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
      )}
    </section>
  )
}
