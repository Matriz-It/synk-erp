import { cookies } from 'next/headers'

const ACCESS_COOKIE = 'synk_access'
const REFRESH_COOKIE = 'synk_refresh'

export async function createSession(accessToken: string, refreshToken: string) {
  const store = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    expires: new Date(Date.now() + 15 * 60 * 1000),
    sameSite: 'lax',
    path: '/',
  })

  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}
