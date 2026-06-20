import { NextRequest, NextResponse } from 'next/server'

const protectedPrefixes = ['/dashboard']
const authRoutes = ['/login', '/signup']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('synk_access')?.value

  // Redireciona a raiz para login (ou dashboard se já autenticado)
  if (pathname === '/') {
    return NextResponse.redirect(new URL(accessToken ? '/dashboard' : '/login', req.nextUrl))
  }

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)'],
}
