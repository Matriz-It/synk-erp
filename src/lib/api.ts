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

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const message = Array.isArray(payload.message)
      ? payload.message[0]
      : (payload.message ?? 'Erro na requisição')
    throw new ApiError(res.status, message)
  }

  return res.json() as Promise<T>
}
