import { cookies } from 'next/headers'
import { createSession } from './session'

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

async function parseError(res: Response): Promise<ApiError> {
  const payload = await res.json().catch(() => ({}))
  const message = Array.isArray(payload.message)
    ? payload.message[0]
    : (payload.message ?? 'Erro na requisição')
  return new ApiError(res.status, message)
}

/** Tenta renovar o access token com o refresh token. Retorna true se conseguiu. */
async function tryRefresh(): Promise<boolean> {
  try {
    const store = await cookies()
    const refreshToken = store.get('synk_refresh')?.value
    if (!refreshToken) return false

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
      cache: 'no-store',
    })
    if (!res.ok) return false

    const data = await res.json() as { accessToken: string; refreshToken: string }
    await createSession(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

/**
 * Executa um fetch com auto-refresh silencioso.
 * Se retornar 401 → tenta renovar o token → refaz a requisição.
 * Se o refresh também falhar → lança ApiError(401).
 */
async function fetchWithRefresh<T>(
  fetchFn: () => Promise<Response>,
  parseBody: (res: Response) => Promise<T>,
): Promise<T> {
  let res = await fetchFn()

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (!refreshed) throw new ApiError(401, 'Sessão expirada. Faça login novamente.')
    res = await fetchFn() // refaz com novo token
  }

  if (!res.ok) throw await parseError(res)
  return parseBody(res)
}

const parseJSON = <T>(res: Response) => res.json() as Promise<T>
const parseVoid = async (_res: Response): Promise<void> => { /* 204 no content */ }

export async function apiGet<T>(path: string): Promise<T> {
  return fetchWithRefresh<T>(
    async () => {
      const auth = await authHeader()
      return fetch(`${API_URL}${path}`, { headers: { ...auth }, cache: 'no-store' })
    },
    parseJSON<T>,
  )
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return fetchWithRefresh<T>(
    async () => {
      const auth = await authHeader()
      return fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
    },
    parseJSON<T>,
  )
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return fetchWithRefresh<T>(
    async () => {
      const auth = await authHeader()
      return fetch(`${API_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
    },
    parseJSON<T>,
  )
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return fetchWithRefresh<T>(
    async () => {
      const auth = await authHeader()
      return fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
    },
    parseJSON<T>,
  )
}

export async function apiPatchVoid(path: string, body: unknown): Promise<void> {
  return fetchWithRefresh<void>(
    async () => {
      const auth = await authHeader()
      return fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
    },
    parseVoid,
  )
}

export async function apiDelete(path: string): Promise<void> {
  return fetchWithRefresh<void>(
    async () => {
      const auth = await authHeader()
      return fetch(`${API_URL}${path}`, {
        method: 'DELETE',
        headers: { ...auth },
        cache: 'no-store',
      })
    },
    parseVoid,
  )
}
