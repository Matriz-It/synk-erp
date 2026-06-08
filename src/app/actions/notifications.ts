'use server'

import { redirect } from 'next/navigation'
import { apiGet, ApiError } from '@/lib/api'
import type { Conta } from '@/components/finance/types'

export interface AppNotification {
  id: string
  title: string
  sub: string
  tone: 'danger' | 'warning' | 'info'
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

export async function getNotificationsAction(): Promise<AppNotification[]> {
  try {
    const [bills, receivables] = await Promise.all([
      apiGet<Conta[]>('/bills').catch(() => [] as Conta[]),
      apiGet<Conta[]>('/receivables').catch(() => [] as Conta[]),
    ])

    const list: AppNotification[] = []

    const billsVencendo = bills.filter(b => b.status === 'vencendo')
    if (billsVencendo.length > 0) {
      const total = billsVencendo.reduce((a, b) => a + b.valor, 0)
      list.push({
        id: 'bills-vencendo',
        title: `${billsVencendo.length} conta${billsVencendo.length !== 1 ? 's' : ''} a pagar vencendo`,
        sub: `Total de ${formatBRL(total)} nos próximos 7 dias`,
        tone: 'warning',
      })
    }

    const billsVencido = bills.filter(b => b.status === 'vencido')
    if (billsVencido.length > 0) {
      const total = billsVencido.reduce((a, b) => a + b.valor, 0)
      list.push({
        id: 'bills-vencido',
        title: `${billsVencido.length} conta${billsVencido.length !== 1 ? 's' : ''} a pagar em atraso`,
        sub: `Total de ${formatBRL(total)} vencido`,
        tone: 'danger',
      })
    }

    const recVencido = receivables.filter(r => r.status === 'vencido')
    if (recVencido.length > 0) {
      const total = recVencido.reduce((a, r) => a + r.valor, 0)
      list.push({
        id: 'rec-vencido',
        title: `${recVencido.length} conta${recVencido.length !== 1 ? 's' : ''} a receber vencida${recVencido.length !== 1 ? 's' : ''}`,
        sub: `Total de ${formatBRL(total)} em atraso`,
        tone: 'danger',
      })
    }

    return list
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login')
    return []
  }
}
