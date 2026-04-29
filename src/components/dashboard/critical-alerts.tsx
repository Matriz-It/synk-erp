import { AlertTriangle, ArrowRight, Clock, PackageX } from "lucide-react"
import Link from "next/link"

interface Alert {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  description: string
  href: string
  tone: "warning" | "danger" | "info"
}

const ALERTS: Alert[] = [
  { icon: PackageX, title: "12 produtos abaixo do mínimo", description: "Reabasteça antes que afete suas vendas.", href: "/dashboard/estoque/produtos", tone: "warning" },
  { icon: Clock, title: "5 boletos vencem em 3 dias", description: "Total de R$ 8.430 a receber até 02/05.", href: "/dashboard/financeiro/receber", tone: "info" },
  { icon: AlertTriangle, title: "3 contas vencidas há +30 dias", description: "Cliente Lima Distribuidora — R$ 4.120.", href: "/dashboard/financeiro/receber", tone: "danger" },
]

export function CriticalAlerts() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-synk-navy">Atenção</h2>
        <span className="rounded-sm bg-synk-warning-bg px-1.5 py-0.5 text-[11px] font-semibold text-synk-warning">3 alertas</span>
      </div>

      <ul className="space-y-2.5">
        {ALERTS.map((alert) => (
          <li key={alert.title}>
            <Link
              href={alert.href}
              className="group flex gap-3 rounded-md border border-transparent p-2.5 transition-colors hover:border-[#E2E8F0] hover:bg-[#F8F9FC]"
            >
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${
                alert.tone === "danger" ? "bg-synk-danger-bg text-synk-danger"
                : alert.tone === "warning" ? "bg-synk-warning-bg text-synk-warning"
                : "bg-synk-indigo-light text-synk-indigo"
              }`}>
                <alert.icon className="size-4" strokeWidth={1.5} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight text-synk-navy">{alert.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-[#64748B]">{alert.description}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 self-center text-[#94A3B8] transition-transform group-hover:translate-x-0.5 group-hover:text-synk-indigo" strokeWidth={1.5} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
