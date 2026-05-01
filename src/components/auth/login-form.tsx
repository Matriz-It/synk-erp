"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff, Lock, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/auth/google-icon"
import { loginAction } from "@/app/actions/auth"

interface FieldErrors {
  identifier?: string
  password?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatIdentifier(raw: string): string {
  if (/[a-zA-Z@]/.test(raw)) return raw

  const digits = raw.replace(/\D/g, "")
  if (!digits) return raw

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
  }

  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

function validate(field: keyof FieldErrors, value: string): string | undefined {
  if (field === "identifier") {
    if (!value) return "Informe seu e-mail, CPF ou CNPJ"
    if (emailRegex.test(value)) return undefined
    const digits = value.replace(/\D/g, "")
    if (digits.length === 11 || digits.length === 14) return undefined
    return "Informe um e-mail, CPF ou CNPJ válido"
  }
  if (field === "password") {
    if (!value) return "Informe sua senha"
    if (value.length < 6) return "A senha deve ter ao menos 6 caracteres"
  }
  return undefined
}

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)

  function handleBlur(field: keyof FieldErrors, value: string) {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validate(field, value) }))
  }

  function handleIdentifierChange(raw: string) {
    const formatted = formatIdentifier(raw)
    setIdentifier(formatted)
    setCredentialError(null)
    if (touched.identifier) {
      setErrors((e) => ({ ...e, identifier: validate("identifier", formatted) }))
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setCredentialError(null)
    if (touched.password) {
      setErrors((e) => ({ ...e, password: validate("password", value) }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FieldErrors = {
      identifier: validate("identifier", identifier),
      password: validate("password", password),
    }
    setTouched({ identifier: true, password: true })
    setErrors(nextErrors)
    if (nextErrors.identifier || nextErrors.password) return

    setIsSubmitting(true)
    setCredentialError(null)

    const result = await loginAction(identifier, password)

    if (result?.error) {
      setCredentialError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="identifier" className="text-[13px] font-medium text-synk-navy">
          E-mail, CPF ou CNPJ
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
            strokeWidth={1.5}
          />
          <Input
            id="identifier"
            type="text"
            inputMode="text"
            autoComplete="username"
            placeholder="email@empresa.com, CPF ou CNPJ"
            value={identifier}
            onChange={(e) => handleIdentifierChange(e.target.value)}
            onBlur={(e) => handleBlur("identifier", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? "identifier-error" : undefined}
            className={`h-11 pl-10 ${errors.identifier ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
          />
        </div>
        {errors.identifier && (
          <p id="identifier-error" className="flex items-center gap-1.5 text-xs text-synk-danger">
            <AlertCircle className="size-3.5" strokeWidth={1.5} />
            {errors.identifier}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-[13px] font-medium text-synk-navy">
            Senha
          </Label>
          <Link
            href="/forgot-password"
            className="text-[13px] font-medium text-synk-indigo transition-colors hover:text-synk-indigo-hover"
          >
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
            strokeWidth={1.5}
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={(e) => handleBlur("password", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.password || !!credentialError}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`h-11 pl-10 pr-10 ${errors.password || credentialError ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-synk-navy"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="size-4" strokeWidth={1.5} />
            ) : (
              <Eye className="size-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {errors.password && !credentialError && (
          <p id="password-error" className="flex items-center gap-1.5 text-xs text-synk-danger">
            <AlertCircle className="size-3.5" strokeWidth={1.5} />
            {errors.password}
          </p>
        )}
      </div>

      {credentialError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-synk-danger/20 bg-synk-danger-bg/50 px-3.5 py-3"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-synk-danger" strokeWidth={1.5} />
          <p className="text-sm text-synk-danger">{credentialError}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full bg-synk-indigo text-[15px] font-semibold hover:bg-synk-indigo-hover disabled:opacity-90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E2E8F0]" />
        <span className="text-xs text-[#94A3B8]">ou continuar com</span>
        <span className="h-px flex-1 bg-[#E2E8F0]" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        className="h-11 w-full border-[#E2E8F0] bg-white text-sm font-medium text-synk-navy hover:bg-[#F8F9FC]"
      >
        <GoogleIcon className="size-4" />
        Entrar com Google
      </Button>
    </form>
  )
}
