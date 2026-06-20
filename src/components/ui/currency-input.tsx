'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'

// Format a number as BRL display string (e.g. 1234.56 → "1.234,56")
export function formatCurrencyDisplay(value: number): string {
  if (!value) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Apply ATM-style BRL mask to raw input — digits accumulate right-to-left as cents.
// Use this for inline <input> elements that can't use CurrencyInput directly.
export function maskBRL(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(-10)
  if (!digits) return ''
  const reais = parseInt(digits, 10) / 100
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais)
}

// Parse a formatted BRL string back to a number (e.g. "1.234,56" → 1234.56)
export function parseBRL(display: string): number {
  const n = parseFloat(String(display).replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

interface CurrencyInputProps {
  value: number
  onChange: (v: number) => void
  id?: string
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
}

export function CurrencyInput({
  value,
  onChange,
  id,
  placeholder = '0,00',
  className,
  error,
  disabled,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatCurrencyDisplay(value))

  // Sync display when the parent resets value (e.g. modal opens/closes)
  useEffect(() => {
    const current = parseBRL(display)
    if (Math.abs(current - value) > 0.001) {
      setDisplay(formatCurrencyDisplay(value))
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(-10)
    if (!digits) {
      setDisplay('')
      onChange(0)
      return
    }
    const reais = parseInt(digits, 10) / 100
    setDisplay(
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(reais),
    )
    onChange(reais)
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-[#94A3B8]">
        R$
      </span>
      <Input
        id={id}
        value={display}
        onChange={handleChange}
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'pl-9 font-mono',
          error && 'border-synk-danger focus-visible:ring-synk-danger/40',
          className,
        )}
      />
    </div>
  )
}
