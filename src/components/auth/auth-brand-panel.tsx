import { Clock, Shield, Database } from "lucide-react"
import { SynkLogo } from "@/components/synk-logo"

const highlights = [
  {
    icon: Clock,
    title: "Onboarding em 10min",
    description: "Configure sua empresa e comece a operar no mesmo dia.",
  },
  {
    icon: Shield,
    title: "99.5% uptime SLA",
    description: "Infraestrutura confiável para sua operação não parar.",
  },
  {
    icon: Database,
    title: "Dados isolados por empresa",
    description: "Multi-tenancy nativo com criptografia em repouso.",
  },
]

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden h-full flex-col justify-between overflow-hidden bg-synk-navy p-12 text-white lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(91,94,232,0.4) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 h-[380px] w-[380px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(61,62,191,0.5) 0%, transparent 70%)" }}
      />

      <div className="relative">
        <SynkLogo variant="dark" />
      </div>

      <div className="relative space-y-12">
        <div className="space-y-4">
          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-balance">
            Gestão para PMEs,
            <br />
            <span className="text-synk-indigo-hover">finalmente simples.</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-slate-400">
            ERP completo com financeiro, estoque e vendas em um só lugar.
            Configure em minutos, sem consultoria.
          </p>
        </div>

        <ul className="space-y-5">
          {highlights.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                <Icon className="size-5 text-synk-indigo-hover" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-400">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-slate-500">
        © 2026 Synk Tecnologia · Todos os direitos reservados
      </p>
    </aside>
  )
}
