'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { updatePlanoAction, type PlanoSelecionavel } from '@/app/actions/plano'

interface PlanoDef {
  id: PlanoSelecionavel | 'personalizado'
  nome: string
  preco: string
  precoValor: number
  periodo?: string
  desc: string
  features: string[]
  destaque?: boolean
}

const PLANOS: PlanoDef[] = [
  {
    id: 'pro',
    nome: 'Pro',
    preco: 'R$ 80',
    precoValor: 80,
    periodo: '/mês',
    desc: 'Para pequenos negócios',
    features: ['Até 50 NF-e por mês', '1 usuário', 'Financeiro básico', 'Estoque básico', 'Suporte por e-mail'],
  },
  {
    id: 'business',
    nome: 'Business',
    preco: 'R$ 189',
    precoValor: 189,
    periodo: '/mês',
    desc: 'Para PMEs em crescimento',
    features: ['NF-e ilimitadas', 'Até 5 usuários', 'Financeiro completo + DRE', 'Estoque multi-depósito', 'Relatórios avançados', 'Suporte via chat (8×5)'],
    destaque: true,
  },
  {
    id: 'personalizado',
    nome: 'Personalizado',
    preco: 'R$ 349+',
    precoValor: 349,
    periodo: '/mês',
    desc: 'Para operações maiores',
    features: ['Tudo do Business', 'Usuários ilimitados', 'Multi-tenancy avançado', 'API aberta', 'Integrações customizadas', 'Suporte prioritário 24×7'],
  },
]

export function PlanoView({ planoAtual }: { planoAtual: string }) {
  const router = useRouter()
  const [atual, setAtual] = useState(planoAtual)
  const [salvando, setSalvando] = useState<string | null>(null)

  // Não mostra planos mais baratos que o atual — evita downgrade acidental pela UI.
  const precoAtual = PLANOS.find((p) => p.id === atual)?.precoValor ?? 0
  const planosVisiveis = PLANOS.filter((p) => p.precoValor >= precoAtual)

  async function escolher(id: PlanoSelecionavel) {
    if (id === atual || salvando) return
    setSalvando(id)
    try {
      await updatePlanoAction(id)
      setAtual(id)
      toast.success('Plano atualizado! Acesse Faturas para efetuar o pagamento.')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao trocar de plano')
    } finally {
      setSalvando(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-synk-navy">Plano</h1>
        <p className="text-sm text-[#64748B]">Escolha o plano ideal para o seu negócio</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {planosVisiveis.map((p) => {
          const isAtual = p.id === atual
          const isPersonalizado = p.id === 'personalizado'

          return (
            <div
              key={p.id}
              className={`flex flex-col rounded-xl border p-6 ${
                p.destaque
                  ? 'border-synk-indigo bg-synk-indigo shadow-lg'
                  : 'border-[#E2E8F0] bg-white'
              }`}
            >
              {p.destaque && (
                <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white">
                  ✦ MAIS POPULAR
                </span>
              )}
              <h3 className={`text-[15px] font-bold ${p.destaque ? 'text-white' : 'text-synk-navy'}`}>{p.nome}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`font-display text-3xl font-bold ${p.destaque ? 'text-white' : 'text-synk-navy'}`}>{p.preco}</span>
                {p.periodo && (
                  <span className={`text-[13px] ${p.destaque ? 'text-white/70' : 'text-[#94A3B8]'}`}>{p.periodo}</span>
                )}
              </div>
              <p className={`mt-1 text-[13px] ${p.destaque ? 'text-white/80' : 'text-[#64748B]'}`}>{p.desc}</p>

              <div className={`my-4 h-px ${p.destaque ? 'bg-white/15' : 'bg-[#F1F5F9]'}`} />

              <ul className="flex flex-1 flex-col gap-2">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-[13px] ${p.destaque ? 'text-white/90' : 'text-[#334155]'}`}>
                    <Check className={`mt-0.5 size-3.5 shrink-0 ${p.destaque ? 'text-white' : 'text-[#14b87e]'}`} strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>

              {isPersonalizado ? (
                <a
                  href="mailto:vendas@synkerp.com?subject=Plano%20personalizado%20Synk%20ERP"
                  className="mt-6 flex h-10 items-center justify-center gap-2 rounded-md border border-[#E2E8F0] bg-white text-[13px] font-semibold text-synk-navy transition-colors hover:bg-[#F8F9FC]"
                >
                  <Mail className="size-3.5" strokeWidth={1.5} />Falar com vendas
                </a>
              ) : isAtual ? (
                <div className={`mt-6 flex h-10 items-center justify-center gap-2 rounded-md text-[13px] font-semibold ${p.destaque ? 'bg-white/15 text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                  <Check className="size-3.5" strokeWidth={2} />Plano atual
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => escolher(p.id as PlanoSelecionavel)}
                  disabled={salvando !== null}
                  className={`mt-6 flex h-10 items-center justify-center gap-2 rounded-md text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    p.destaque
                      ? 'bg-white text-synk-indigo hover:bg-white/90'
                      : 'bg-synk-indigo text-white hover:bg-synk-indigo-hover'
                  }`}
                >
                  {salvando === p.id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {salvando === p.id ? 'Trocando...' : 'Selecionar plano'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
