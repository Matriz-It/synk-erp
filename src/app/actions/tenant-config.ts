'use server'

import { apiGet, apiPatch, ApiError } from '@/lib/api'
import { redirect } from 'next/navigation'

export interface TenantConfigData {
  id?: string
  // Dados complementares
  nomeFantasia?: string | null
  ie?: string | null
  im?: string | null
  cnae?: string | null
  telefone?: string | null
  emailComercial?: string | null
  // Endereço
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  // Fiscal
  crt?: string | null
  serieNfe?: string | null
  ambienteNfe?: string | null
  cfopPadrao?: string | null
  cstPadrao?: string | null
  aliqIcms?: number | null
  aliqIbs?: number | null
  aliqCbs?: number | null
  emailNfe?: string | null
  // Certificado (sem base64 e senha — segurança)
  certificadoNome?: string | null
  certificadoValidade?: string | null
  temCertificado?: boolean
}

function handleAuth(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) redirect('/login')
  throw err
}

export async function getTenantConfigAction(): Promise<TenantConfigData | null> {
  try {
    return await apiGet<TenantConfigData>('/tenant-config')
  } catch (err) {
    return handleAuth(err)
  }
}

export async function saveTenantConfigAction(
  data: Partial<TenantConfigData> & { certificadoBase64?: string; certificadoSenha?: string },
): Promise<{ error: string } | undefined> {
  try {
    await apiPatch('/tenant-config', data)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Erro ao salvar configurações. Tente novamente.' }
  }
}
