'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Clock, CreditCard, Receipt } from 'lucide-react'
import type { MeData } from '@/app/actions/auth'
import { type Fatura, formatBRL, formatDate } from './types'
import { FaturaStatusBadge } from './fatura-status-badge'
import { FaturaPagamentoSheet } from './fatura-pagamento-sheet'

export function FaturasView({
  initialFaturas, tenant, email,
}: {
  initialFaturas: Fatura[]
  tenant: MeData['tenant'] | null
  email: string
}) {
  const router = useRouter()
  const [faturas, setFaturas] = useState(initialFaturas)
  const [pagando, setPagando] = useState<Fatura | null>(null)

  const blocked = tenant?.billingBlocked ?? false
  const trialEndsAt = tenant?.trialEndsAt ?? null
  const pendente = faturas.find((f) => f.status === 'pendente')
  const emTrial = !blocked && !pendente && trialEndsAt && new Date(trialEndsAt) > new Date()

  function onPago(atualizada: Fatura) {
    setFaturas((prev) => prev.map((f) => (f.id === atualizada.id ? atualizada : f)))
    setPagando(null)
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-synk-navy">Faturas</h1>
        <p className="text-sm text-[#64748B]">Histórico de pagamentos e próximas cobranças</p>
      </div>

      {blocked && pendente && (
        <div className="flex items-start gap-3 rounded-lg border border-[#fecaca] bg-[#FEE2E2] p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ef4444]" strokeWidth={1.5} />
          <div>
            <p className="text-[14px] font-semibold text-[#991B1B]">Acesso bloqueado por pendência</p>
            <p className="mt-0.5 text-[13px] text-[#7f1d1d]">
              A fatura #{pendente.numero} de {formatBRL(pendente.valor)} venceu em {formatDate(pendente.vencimento)}.
              Pague abaixo para voltar a usar o sistema normalmente.
            </p>
          </div>
        </div>
      )}

      {!blocked && pendente && (
        <div className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8F9FC] p-4">
          <Receipt className="mt-0.5 size-5 shrink-0 text-[#64748B]" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-synk-navy">Próxima cobrança</p>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              {formatBRL(pendente.valor)} — vencimento em {formatDate(pendente.vencimento)}
            </p>
          </div>
          <Link href="/dashboard/configuracoes/plano" className="shrink-0 text-[13px] font-semibold text-synk-indigo hover:text-synk-indigo-hover">
            Trocar de plano
          </Link>
        </div>
      )}

      {emTrial && trialEndsAt && (
        <div className="flex items-start gap-3 rounded-lg border border-synk-indigo/20 bg-synk-indigo-light p-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-synk-indigo" strokeWidth={1.5} />
          <div>
            <p className="text-[14px] font-semibold text-synk-navy">Período de teste gratuito</p>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              Seu trial termina em {formatDate(trialEndsAt.split('T')[0])}. Nenhuma cobrança foi gerada ainda.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {faturas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Receipt className="size-10 text-[#CBD5E1]" strokeWidth={1.5} />
            <p className="text-[15px] font-semibold text-synk-navy">Nenhuma fatura ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8F9FC]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Fatura</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Ciclo</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Valor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Vencimento</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Pago em</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {faturas.map((f, i) => (
                  <tr key={f.id} className={i < faturas.length - 1 ? 'border-b border-[#F1F5F9]' : ''}>
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-synk-indigo">#{f.numero}</td>
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{formatDate(f.cicloInicio)} – {formatDate(f.cicloFim)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] font-bold text-synk-navy">{formatBRL(f.valor)}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#64748B]">{formatDate(f.vencimento)}</td>
                    <td className="px-4 py-3 text-center"><FaturaStatusBadge fatura={f} /></td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#94A3B8]">{f.pagoEm ? formatDate(f.pagoEm) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {f.status === 'pendente' && (
                        <button
                          type="button"
                          onClick={() => setPagando(f)}
                          className="flex items-center gap-1.5 rounded-md bg-synk-indigo px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-synk-indigo-hover"
                        >
                          <CreditCard className="size-3.5" strokeWidth={1.5} />Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FaturaPagamentoSheet
        fatura={pagando}
        email={email}
        onClose={() => setPagando(null)}
        onPago={onPago}
      />
    </div>
  )
}
