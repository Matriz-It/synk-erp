import { NextRequest, NextResponse } from 'next/server'

const protectedPrefixes = ['/dashboard']
const authRoutes = ['/login', '/signup']
const FATURAS_PATH = '/dashboard/faturas'
const API_URL = process.env.API_URL ?? 'http://localhost:3000/api/v1'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('synk_access')?.value

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Trava por inadimplência: qualquer página de /dashboard exceto a de Faturas
  // redireciona pra lá quando a fatura do tenant está vencida. Falha aberta —
  // uma instabilidade de rede aqui não deve travar o app inteiro; a trava de
  // verdade continua sendo o guard global da API (TenantBillingGuard).
  if (isProtected && accessToken && pathname !== FATURAS_PATH) {
    const blocked = await checkBilling(accessToken)
    if (blocked) return NextResponse.redirect(new URL(FATURAS_PATH, req.nextUrl))
  }

  return NextResponse.next()
}

async function checkBilling(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/faturas/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const data = await res.json() as { blocked?: boolean }
    return !!data.blocked
  } catch {
    return false
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)'],
}
