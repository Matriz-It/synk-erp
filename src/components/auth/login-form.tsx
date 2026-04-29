"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/auth/google-icon"

interface FieldErrors {
  email?: string
  password?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(field: keyof FieldErrors, value: string): string | undefined {
  if (field === "email") {
    if (!value) return "Informe seu e-mail"
    if (!emailRegex.test(value)) return "Formato de e-mail inválido"
  }
  if (field === "password") {
    if (!value) return "Informe sua senha"
    if (value.length < 6) return "A senha deve ter ao menos 6 caracteres"
  }
  return undefined
}

export function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
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

  function handleChange(field: keyof FieldErrors, value: string) {
    if (field === "email") setEmail(value)
    else setPassword(value)
    setCredentialError(null)
    if (touched[field]) {
      setErrors((e) => ({ ...e, [field]: validate(field, value) }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FieldErrors = {
      email: validate("email", email),
      password: validate("password", password),
    }
    setTouched({ email: true, password: true })
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setIsSubmitting(true)
    setCredentialError(null)

    await new Promise((resolve) => setTimeout(resolve, 1100))

    if (email === "errado@synk.com" || password === "wrongpass") {
      setCredentialError("E-mail ou senha incorretos")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[13px] font-medium text-synk-navy">
          E-mail
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
            strokeWidth={1.5}
          />
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com.br"
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`h-11 pl-10 ${errors.email ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="flex items-center gap-1.5 text-xs text-synk-danger">
            <AlertCircle className="size-3.5" strokeWidth={1.5} />
            {errors.email}
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
            onChange={(e) => handleChange("password", e.target.value)}
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
