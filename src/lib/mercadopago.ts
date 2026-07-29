import { initMercadoPago } from '@mercadopago/sdk-react'

let initialized = false

/** Inicializa o SDK do Mercado Pago uma única vez (idempotente entre remounts). */
export function ensureMpInitialized(): void {
  if (initialized) return
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
  if (!publicKey) {
    console.error('NEXT_PUBLIC_MP_PUBLIC_KEY não configurado — checkout do Mercado Pago não vai funcionar.')
    return
  }
  initMercadoPago(publicKey, { locale: 'pt-BR' })
  initialized = true
}
