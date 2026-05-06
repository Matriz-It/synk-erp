import { Clock, type LucideIcon } from "lucide-react"

interface ComingSoonProps {
  label: string
  icon: LucideIcon
}

export function ComingSoon({ label, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-[72px] items-center justify-center rounded-[20px] bg-synk-indigo-light">
        <Icon className="size-8 text-synk-indigo" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-synk-navy">{label}</h2>
        <p className="mt-1.5 max-w-[360px] text-sm text-[#64748B]">
          Esta seção está em desenvolvimento. Em breve você poderá acessar todos os recursos de {label.toLowerCase()}.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8F9FC] px-6 py-3.5 text-[13px] text-[#64748B]">
        <Clock className="mt-px size-3.5 shrink-0 text-[#94A3B8]" strokeWidth={1.5} />
        Módulo em construção — em breve
      </div>
    </div>
  )
}
