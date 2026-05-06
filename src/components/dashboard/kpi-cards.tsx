import { ArrowDownRight, ArrowUpRight, PackageSearch, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import type { StockStats } from "@/app/actions/dashboard"

interface Kpi {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  positiveDirection: "up" | "down"
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  caption: string
}

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
}

function buildKpis(stock: StockStats): Kpi[] {
  const stockTrend = stock.abaixoMinimo > 0 ? "down" : "up"
  const stockDelta = stock.abaixoMinimo > 0
    ? `-${stock.abaixoMinimo} abaixo min.`
    : `${stock.semEstoque === 0 ? "Estoque OK" : `${stock.semEstoque} zerados`}`

  return [
    {
      label: "Faturamento do mês",
      value: "R$ 184.230",
      delta: "+12,4%",
      trend: "up",
      positiveDirection: "up",
      icon: TrendingUp,
      caption: "vs. mês anterior",
    },
    {
      label: "Inadimplência",
      value: "R$ 12.480",
      delta: "+3,1%",
      trend: "up",
      positiveDirection: "down",
      icon: TrendingDown,
      caption: "8 contas vencidas há +30 dias",
    },
    {
      label: "Itens em estoque",
      value: stock.totalItens.toLocaleString("pt-BR"),
      delta: stockDelta,
      trend: stockTrend,
      positiveDirection: "up",
      icon: PackageSearch,
      caption: `${stock.totalProdutos} produto${stock.totalProdutos !== 1 ? "s" : ""} · ${formatBRL(stock.valorTotal)}`,
    },
    {
      label: "Saldo em caixa",
      value: "R$ 86.910",
      delta: "+8,2%",
      trend: "up",
      positiveDirection: "up",
      icon: Wallet,
      caption: "3 contas · projeção positiva",
    },
  ]
}

export function KpiCards({ stock }: { stock: StockStats }) {
  const kpis = buildKpis(stock)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
    </div>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  const isPositive = kpi.trend === kpi.positiveDirection
  const isNeutral = kpi.trend === "neutral"

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">{kpi.label}</span>
        <span className="flex size-9 items-center justify-center rounded-md bg-synk-indigo-light text-synk-indigo">
          <Icon className="size-4" strokeWidth={1.5} />
        </span>
      </div>
      <p className="font-display text-[26px] font-bold leading-none tracking-tight text-synk-navy">{kpi.value}</p>
      <div className="flex items-center justify-between gap-2">
        {isNeutral ? (
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
            {kpi.delta}
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${
            isPositive ? "bg-synk-success-bg text-synk-success" : "bg-synk-danger-bg text-synk-danger"
          }`}>
            {kpi.trend === "up"
              ? <ArrowUpRight className="size-3" strokeWidth={2} />
              : <ArrowDownRight className="size-3" strokeWidth={2} />}
            {kpi.delta}
          </span>
        )}
        <span className="truncate text-[12px] text-[#94A3B8]">{kpi.caption}</span>
      </div>
    </article>
  )
}
