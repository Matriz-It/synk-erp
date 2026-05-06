import { Calendar, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMeAction } from "@/app/actions/auth"

export async function DashboardHeader() {
  const me = await getMeAction()

  const firstName = me?.user.name?.split(' ')[0] ?? 'você'

  const now = new Date()
  const month = now.toLocaleDateString('pt-BR', { month: 'long' })
  const year = now.getFullYear()
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-synk-navy sm:text-[28px]">
          Olá, {firstName} — bem-vindo(a) de volta
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Aqui está o resumo da sua operação em {month} de {year}.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="h-10 gap-2 border-[#E2E8F0] bg-white text-[13px] font-medium text-synk-navy hover:bg-[#F1F5F9]">
          <Calendar className="size-4" strokeWidth={1.5} />
          {monthCap} · {year}
        </Button>
        <Button variant="outline" className="h-10 gap-2 border-[#E2E8F0] bg-white text-[13px] font-medium text-synk-navy hover:bg-[#F1F5F9]">
          <Download className="size-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
        <Button className="h-10 gap-2 bg-synk-indigo text-[13px] font-semibold hover:bg-synk-indigo-hover">
          <Plus className="size-4" strokeWidth={2} />
          Novo pedido
        </Button>
      </div>
    </div>
  )
}
