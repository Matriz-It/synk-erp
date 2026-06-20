'use server'

import { revalidatePath } from 'next/cache'
import { apiPatch, apiPatchVoid, ApiError } from '@/lib/api'

export async function updateProfileAction(data: {
  name?: string
  document?: string
}): Promise<{ error: string } | undefined> {
  try {
    await apiPatch('/auth/me', data)
    revalidatePath('/dashboard', 'layout')
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Erro ao atualizar perfil. Tente novamente.' }
  }
}

export async function changePasswordAction(data: {
  currentPassword: string
  newPassword: string
}): Promise<{ error: string } | undefined> {
  try {
    await apiPatchVoid('/auth/me/password', data)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Erro ao alterar senha. Tente novamente.' }
  }
}
