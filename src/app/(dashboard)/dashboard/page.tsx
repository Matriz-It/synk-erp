import { getDashboardStatsAction } from "@/app/actions/dashboard"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { ReceivablesTable } from "@/components/dashboard/receivables-table"
import { CriticalAlerts } from "@/components/dashboard/critical-alerts"

export default async function DashboardPage() {
  const stats = await getDashboardStatsAction()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardHeader />
      <KpiCards stock={stats.stock} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart />
        </div>
        <CriticalAlerts abaixoMinimo={stats.stock.abaixoMinimo} semEstoque={stats.stock.semEstoque} />
      </div>

      <ReceivablesTable />
    </div>
  )
}
