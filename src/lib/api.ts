import { cookies } from 'next/headers'

const API_URL = process.env.API_URL ?? 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const store = await cookies()
    const token = store.get('synk_access')?.value
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const message = Array.isArray(payload.message)
      ? payload.message[0]
      : (payload.message ?? 'Erro na requisição')
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}

export async function apiGet<T>(path: string): Promise<T> {
  const auth = await authHeader()
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...auth },
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const auth = await authHeader()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const auth = await authHeader()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...auth },
    cache: 'no-store',
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const message = Array.isArray(payload.message)
      ? payload.message[0]
      : (payload.message ?? 'Erro na requisição')
    throw new ApiError(res.status, message)
  }
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const auth = await authHeader()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return handleResponse<T>(res)
}
