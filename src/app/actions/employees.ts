'use server'

import { revalidatePath } from 'next/cache'
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api'

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  status: string
  document: string
  createdAt: string
}

export async function listEmployeesAction(): Promise<Employee[]> {
  return apiGet<Employee[]>('/employees')
}

export async function createEmployeeAction(data: {
  name: string
  email: string
  password: string
  role: string
  document?: string
}): Promise<{ error: string } | undefined> {
  try {
    await apiPost('/employees', data)
    revalidatePath('/dashboard/configuracoes/equipe')
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { error: 'E-mail já cadastrado' }
      if (err.status === 400) return { error: err.message }
      if (err.status === 403) return { error: 'Sem permissão para esta ação' }
    }
    return { error: 'Erro ao criar funcionário. Tente novamente.' }
  }
}

export async function updateEmployeeAction(
  id: string,
  data: { name?: string; role?: string; status?: string; password?: string },
): Promise<{ error: string } | undefined> {
  try {
    await apiPatch(`/employees/${id}`, data)
    revalidatePath('/dashboard/configuracoes/equipe')
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) return { error: err.message }
      if (err.status === 400) return { error: err.message }
    }
    return { error: 'Erro ao atualizar funcionário. Tente novamente.' }
  }
}

export async function removeEmployeeAction(
  id: string,
): Promise<{ error: string } | undefined> {
  try {
    await apiDelete(`/employees/${id}`)
    revalidatePath('/dashboard/configuracoes/equipe')
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 403) return { error: err.message }
    }
    return { error: 'Erro ao remover funcionário. Tente novamente.' }
  }
}
