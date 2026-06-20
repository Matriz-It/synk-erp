import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Converte YYYY-MM-DD → DD/MM/YYYY sem depender de locale do ambiente */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const s = iso.split('T')[0]   // suporta ISO com horário
  const parts = s.split('-')
  if (parts.length !== 3) return iso
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
