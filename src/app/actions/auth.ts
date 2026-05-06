'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import { createSession, deleteSession } from '@/lib/session'

export interface MeData {
  user: { name: string; email: string; role: string }
  tenant: { name: string; document: string | null; plan: string }
}

export async function getMeAction(): Promise<MeData | null> {
  try {
    return await apiGet<MeData>('/auth/me')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login')
    return null
  }
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export async function loginAction(
  identifier: string,
  password: string,
): Promise<{ error: string } | undefined> {
  try {
    const data = await apiPost<AuthTokens>('/auth/login', { identifier, password })
    await createSession(data.accessToken, data.refreshToken)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { error: 'E-mail ou senha incorretos' }
    }
    return { error: 'Erro ao fazer login. Tente novamente.' }
  }
  redirect('/dashboard')
}

export async function registerAction(payload: {
  tenantName: string
  tenantDocument?: string
  adminName: string
  adminEmail: string
  adminPassword: string
  adminDocument?: string
}): Promise<{ error: string } | undefined> {
  try {
    const data = await apiPost<AuthTokens>('/auth/register', payload)
    await createSession(data.accessToken, data.refreshToken)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { error: err.message }
      if (err.status === 400) return { error: err.message }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }
  redirect('/dashboard')
}

export async function logoutAction() {
  await deleteSession()
  // redirect é feito no cliente após o await (redirect() não funciona em onClick handlers)
}
