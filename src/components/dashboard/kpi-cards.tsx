import { ArrowDownRight, ArrowUpRight, PackageSearch, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import type { StockStats } from "@/app/actions/dashboard"

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
}

interface FinanceiroStats {
  faturamento:  number
  inadimplencia: number
  saldoCaixa:   number
}

interface Kpi {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
  positiveDirection: "up" | "down"
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  caption: string
}

function buildKpis(stock: StockStats, fin: FinanceiroStats): Kpi[] {
  const stockTrend = stock.abaixoMinimo > 0 ? "down" : "up"
  const stockDelta = stock.abaixoMinimo > 0
    ? `-${stock.abaixoMinimo} abaixo min.`
    : stock.semEstoque === 0 ? "Estoque OK" : `${stock.semEstoque} zerados`

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" })
  const monthCap  = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return [
    {
      label: "Faturamento do mês",
      value: formatBRL(fin.faturamento),
      delta: fin.faturamento > 0 ? "Recebido" : "Sem recebimentos",
      trend: fin.faturamento > 0 ? "up" : "neutral",
      positiveDirection: "up",
      icon: TrendingUp,
      caption: `Entradas em ${monthCap}`,
    },
    {
      label: "Inadimplência",
      value: formatBRL(fin.inadimplencia),
      delta: fin.inadimplencia > 0 ? "Em atraso" : "Sem atrasos",
      trend: fin.inadimplencia > 0 ? "up" : "neutral",
      positiveDirection: "down",
      icon: TrendingDown,
      caption: fin.inadimplencia > 0 ? "Contas a receber vencidas" : "Tudo em dia",
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
      value: formatBRL(fin.saldoCaixa),
      delta: fin.saldoCaixa >= 0 ? "Positivo" : "Negativo",
      trend: fin.saldoCaixa >= 0 ? "up" : "down",
      positiveDirection: "up",
      icon: Wallet,
      caption: `Saldo acumulado até ${monthCap}`,
    },
  ]
}

export function KpiCards({ stock, financeiro }: { stock: StockStats; financeiro: FinanceiroStats }) {
  const kpis = buildKpis(stock, financeiro)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
    </div>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  const isPositive = kpi.trend === kpi.positiveDirection
  const isNeutral  = kpi.trend === "neutral"

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">{kpi.label}</span>
        <span className="flex size-9 items-center justify-center rounded-md bg-synk-indigo-light text-synk-indigo">
          <Icon className="size-4" strokeWidth={1.5} />
        </span>
      </div>
      <p className="font-display text-[22px] font-bold leading-none tracking-tight text-synk-navy sm:text-[26px]">{kpi.value}</p>
      <div className="flex items-center justify-between gap-2">
        {isNeutral ? (
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[11px] font-semibold text-[#64748B]">{kpi.delta}</span>
        ) : (
          <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${isPositive ? "bg-synk-success-bg text-synk-success" : "bg-synk-danger-bg text-synk-danger"}`}>
            {kpi.trend === "up" ? <ArrowUpRight className="size-3" strokeWidth={2} /> : <ArrowDownRight className="size-3" strokeWidth={2} />}
            {kpi.delta}
          </span>
        )}
        <span className="truncate text-[12px] text-[#94A3B8]">{kpi.caption}</span>
      </div>
    </article>
  )
}
