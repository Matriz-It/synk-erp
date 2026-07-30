import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getDashboardStatsAction } from "@/app/actions/dashboard"
import { getCashflowAction, type LancamentoCaixa } from "@/app/actions/cashflow"
import { listReceivablesAction } from "@/app/actions/receivables"
import { listBillsAction } from "@/app/actions/bills"
import { getFaturaStatusAction } from "@/app/actions/faturas"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { ReceivablesTable } from "@/components/dashboard/receivables-table"
import { CriticalAlerts } from "@/components/dashboard/critical-alerts"
import { formatDate } from "@/components/finance/types"
import { formatBRL, diasEmAtraso } from "@/components/faturas/types"
import type { StatusKind } from "@/components/dashboard/status-badge"

const currentMonth = new Date().toISOString().slice(0, 7)

function computeWeekly(lancamentos: LancamentoCaixa[]) {
  return ['S1', 'S2', 'S3', 'S4', 'S5'].map((week, i) => {
    const ini = i * 7 + 1
    const fim = ini + 6
    const w = lancamentos.filter(l => {
      const d = parseInt(l.data.split('-')[2])
      return d >= ini && d <= fim
    })
    return {
      week,
      entradas: w.filter(l => l.tipo === 'entrada').reduce((a, l) => a + l.valor, 0),
      saidas:   w.filter(l => l.tipo === 'saida').reduce((a, l) => a + l.valor, 0),
    }
  })
}

export default async function DashboardPage() {
  const [stats, receivables, billsVencendo, cashflow, faturaStatus] = await Promise.all([
    getDashboardStatsAction(),
    listReceivablesAction().catch(() => []),
    listBillsAction({ status: 'vencendo' }).catch(() => []),
    getCashflowAction({ mes: currentMonth }).catch(() => null),
    getFaturaStatusAction(),
  ])

  const faturaAtual = faturaStatus?.faturaAtual
  const diasAtraso = faturaAtual && faturaAtual.status === 'pendente' ? diasEmAtraso(faturaAtual.vencimento) : 0

  // KPI financeiros
  const financeiro = {
    faturamento: cashflow?.totais.entradas ?? 0,
    inadimplencia: receivables
      .filter(r => r.status === 'vencido')
      .reduce((a, r) => a + r.valor, 0),
    saldoCaixa: cashflow?.totais.saldoAtual ?? 0,
  }

  // Alertas de boletos
  const boletosVencendo = {
    count: billsVencendo.length,
    valor: billsVencendo.reduce((a, b) => a + b.valor, 0),
  }

  // Gráfico: dados semanais do cashflow real
  const chartData = cashflow ? computeWeekly(cashflow.lancamentos) : []

  // Tabela: top 6 contas a receber por urgência
  const statusOrder: Record<string, number> = { vencido: 0, vencendo: 1, aberto: 2, pago: 3 }
  const tableRows = [...receivables]
    .sort((a, b) =>
      (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4) ||
      a.vencimento.localeCompare(b.vencimento)
    )
    .slice(0, 6)
    .map(r => ({
      order:   `#${r.numero}`,
      client:  r.parceiro,
      value:   r.valor,
      dueDate: formatDate(r.vencimento),
      status:  r.status as StatusKind,
    }))

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {diasAtraso > 0 && faturaAtual && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${
          faturaStatus?.blocked ? 'border-[#fecaca] bg-[#FEE2E2]' : 'border-[#fde68a] bg-[#FFFBEB]'
        }`}
        >
          <AlertTriangle
            className={`mt-0.5 size-5 shrink-0 ${faturaStatus?.blocked ? 'text-[#ef4444]' : 'text-[#d97706]'}`}
            strokeWidth={1.5}
          />
          <div className="flex-1">
            <p className={`text-[14px] font-semibold ${faturaStatus?.blocked ? 'text-[#991B1B]' : 'text-[#92400E]'}`}>
              {faturaStatus?.blocked ? 'Acesso bloqueado por pendência' : 'Fatura em atraso'}
            </p>
            <p className={`mt-0.5 text-[13px] ${faturaStatus?.blocked ? 'text-[#7f1d1d]' : 'text-[#92400E]'}`}>
              A fatura #{faturaAtual.numero} de {formatBRL(faturaAtual.valor)} está vencida há {diasAtraso} dia{diasAtraso !== 1 ? 's' : ''}.{' '}
              {faturaStatus?.blocked
                ? 'Regularize o pagamento para voltar a usar o sistema.'
                : 'Regularize o pagamento para evitar o bloqueio do sistema.'}
            </p>
          </div>
          <Link href="/dashboard/faturas" className="shrink-0 self-center text-[13px] font-semibold text-synk-indigo hover:text-synk-indigo-hover">
            Ver fatura
          </Link>
        </div>
      )}

      <DashboardHeader />
      <KpiCards stock={stats.stock} financeiro={financeiro} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowChart data={chartData} />
        </div>
        <CriticalAlerts
          abaixoMinimo={stats.stock.abaixoMinimo}
          semEstoque={stats.stock.semEstoque}
          boletosVencendo={boletosVencendo}
        />
      </div>

      <ReceivablesTable rows={tableRows} />
    </div>
  )
}
