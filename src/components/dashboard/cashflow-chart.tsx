"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { week: "S1", entradas: 38500, saidas: 22300 },
  { week: "S2", entradas: 42100, saidas: 28900 },
  { week: "S3", entradas: 51200, saidas: 31400 },
  { week: "S4", entradas: 47800, saidas: 25600 },
  { week: "S5", entradas: 39200, saidas: 23100 },
]

const chartConfig = {
  entradas: { label: "Entradas", color: "var(--synk-indigo)" },
  saidas: { label: "Saídas", color: "var(--synk-indigo-hover)" },
} satisfies ChartConfig

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL", maximumFractionDigits: 1 }).format(value)

export function CashflowChart() {
  const totalEntradas = data.reduce((acc, d) => acc + d.entradas, 0)
  const totalSaidas = data.reduce((acc, d) => acc + d.saidas, 0)
  const saldo = totalEntradas - totalSaidas

  return (
    <section className="flex h-full flex-col gap-5 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-synk-navy">Fluxo de Caixa — Maio 2026</h2>
          <p className="text-[13px] text-[#64748B]">Comparativo de entradas e saídas por semana</p>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <Legend color="var(--synk-indigo)" label="Entradas" />
          <Legend color="var(--synk-indigo-hover)" label="Saídas" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-[#F1F5F9] pb-4">
        <Stat label="Entradas" value={totalEntradas} color="text-synk-success" />
        <Stat label="Saídas" value={totalSaidas} color="text-synk-danger" />
        <Stat label="Saldo" value={saldo} color="text-synk-navy" />
      </div>

      <div className="min-h-0 flex-1">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => formatBRL(v)} width={56} />
              <ChartTooltip
                cursor={{ fill: "rgba(61,62,191,0.05)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="text-[#64748B]">{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                        <span className="font-mono font-semibold text-synk-navy">{formatBRL(value as number)}</span>
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="entradas" fill="var(--synk-indigo)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" fill="var(--synk-indigo-hover)" radius={[4, 4, 0, 0]} opacity={0.55} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </section>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} aria-hidden="true" />
      <span className="text-[#64748B]">{label}</span>
    </span>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className={`font-display text-lg font-bold ${color}`}>
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)}
      </p>
    </div>
  )
}
