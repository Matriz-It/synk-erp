"use client"

import { useState } from "react"
import Link from "next/link"
import { registerAction } from "@/app/actions/auth"
import {
  AlertCircle, ArrowLeft, Check, Eye, EyeOff, Loader2,
  Lock, Mail, User, Building2, Sparkles, IdCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

type Step = 1 | 2

interface SignupData {
  fullName: string
  cpf: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
  segment: string
  size: string
  cnpj: string
  acceptedTerms: boolean
}

type FieldKey = keyof SignupData
type Errors = Partial<Record<FieldKey, string>>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function passwordStrength(password: string): { score: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!password) return { score: 0, label: "—", color: "#E2E8F0" }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score: 1, label: "Fraca", color: "#EF4444" }
  if (score === 2) return { score: 2, label: "Média", color: "#F59E0B" }
  return { score: 3, label: "Forte", color: "#14B87E" }
}

function maskCPF(value: string) {
  return value
    .replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
}

function isValidCPF(cpf: string) {
  const d = cpf.replace(/\D/g, "")
  return d.length === 11 && !/^(\d)\1{10}$/.test(d)
}

function maskCNPJ(value: string) {
  return value
    .replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

function isValidCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "")
  return digits.length === 14 && !/^(\d)\1+$/.test(digits)
}

function validate(field: FieldKey, value: string | boolean, data: SignupData): string | undefined {
  switch (field) {
    case "fullName":
      if (!value) return "Informe seu nome completo"
      if ((value as string).trim().split(" ").length < 2) return "Informe nome e sobrenome"
      return
    case "cpf":
      if (!value) return undefined
      if (!isValidCPF(value as string)) return "CPF inválido"
      return
    case "email":
      if (!value) return "Informe seu e-mail"
      if (!emailRegex.test(value as string)) return "Formato inválido"
      return
    case "password":
      if (!value) return "Crie uma senha"
      if ((value as string).length < 8) return "A senha deve ter ao menos 8 caracteres"
      return
    case "confirmPassword":
      if (!value) return "Confirme a senha"
      if (value !== data.password) return "As senhas não coincidem"
      return
    case "companyName":
      if (!value) return "Informe o nome da empresa"
      return
    case "segment":
      if (!value) return "Selecione um segmento"
      return
    case "size":
      if (!value) return "Selecione o tamanho"
      return
    case "cnpj":
      if (!value) return undefined
      if (!isValidCNPJ(value as string)) return "CNPJ inválido"
      return
    case "acceptedTerms":
      if (!value) return "Você precisa aceitar os termos"
      return
  }
  return undefined
}

export function SignupFlow() {
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [data, setData] = useState<SignupData>({
    fullName: "", cpf: "", email: "", password: "", confirmPassword: "",
    companyName: "", segment: "", size: "", cnpj: "", acceptedTerms: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  function update<K extends FieldKey>(key: K, value: SignupData[K]) {
    setData((d) => ({ ...d, [key]: value }))
    if (touched[key]) {
      setErrors((e) => ({ ...e, [key]: validate(key, value, { ...data, [key]: value }) }))
    }
  }

  function blur(key: FieldKey) {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((e) => ({ ...e, [key]: validate(key, data[key], data) }))
  }

  function goToStep2() {
    const fields: FieldKey[] = ["fullName", "email", "password", "confirmPassword"]
    const next: Errors = {}
    fields.forEach((f) => (next[f] = validate(f, data[f], data)))
    setErrors((e) => ({ ...e, ...next }))
    setTouched((t) => ({ ...t, fullName: true, email: true, password: true, confirmPassword: true }))
    if (Object.values(next).every((v) => !v)) setStep(2)
  }

  async function submit() {
    const fields: FieldKey[] = ["companyName", "segment", "size", "cnpj", "acceptedTerms"]
    const next: Errors = {}
    fields.forEach((f) => (next[f] = validate(f, data[f], data)))
    setErrors((e) => ({ ...e, ...next }))
    setTouched((t) => ({ ...t, companyName: true, segment: true, size: true, cnpj: true, acceptedTerms: true }))
    if (!Object.values(next).every((v) => !v)) return

    setIsSubmitting(true)
    setSubmitError(null)

    const result = await registerAction({
      tenantName: data.companyName,
      tenantDocument: data.cnpj || undefined,
      adminName: data.fullName,
      adminEmail: data.email,
      adminPassword: data.password,
      adminDocument: data.cpf || undefined,
    })

    if (result?.error) {
      setSubmitError(result.error)
      setIsSubmitting(false)
    }
  }

  const strength = passwordStrength(data.password)

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Etapa {step} de 2
        </p>
        <Progress value={step === 1 ? 50 : 100} className="h-1 bg-[#E2E8F0] [&>div]:bg-synk-indigo" />
      </div>

      {step === 1 ? (
        <div className="space-y-7">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-synk-indigo-light px-3 py-1 text-xs font-semibold text-synk-indigo">
              <Sparkles className="size-3.5" strokeWidth={1.5} />
              14 dias grátis — sem cartão
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-synk-navy">Crie sua conta</h1>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Trial gratuito de 14 dias, sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); goToStep2() }} className="space-y-5" noValidate>
            <FieldRow id="fullName" label="Nome completo" icon={User} placeholder="Maria da Silva"
              value={data.fullName} error={errors.fullName}
              onChange={(v) => update("fullName", v)} onBlur={() => blur("fullName")} autoComplete="name" />

            <div className="space-y-1.5">
              <Label htmlFor="cpf" className="flex items-center justify-between text-[13px] font-medium text-synk-navy">
                CPF
                <span className="text-xs font-normal text-[#94A3B8]">Opcional</span>
              </Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
                <Input
                  id="cpf" inputMode="numeric" autoComplete="off"
                  placeholder="000.000.000-00"
                  value={data.cpf}
                  onChange={(e) => update("cpf", maskCPF(e.target.value))}
                  onBlur={() => blur("cpf")}
                  aria-invalid={!!errors.cpf}
                  className={`h-11 pl-10 font-mono ${errors.cpf ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
                />
              </div>
              {errors.cpf && (
                <p className="flex items-center gap-1.5 text-xs text-synk-danger">
                  <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.cpf}
                </p>
              )}
            </div>

            <FieldRow id="email" type="email" label="E-mail corporativo" icon={Mail}
              placeholder="maria@empresa.com.br" value={data.email} error={errors.email}
              onChange={(v) => update("email", v)} onBlur={() => blur("email")} autoComplete="email" />

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-synk-navy">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
                <Input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres" value={data.password}
                  onChange={(e) => update("password", e.target.value)} onBlur={() => blur("password")}
                  aria-invalid={!!errors.password}
                  className={`h-11 pl-10 pr-10 ${errors.password ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-synk-navy"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff className="size-4" strokeWidth={1.5} /> : <Eye className="size-4" strokeWidth={1.5} />}
                </button>
              </div>
              {data.password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex h-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <span key={i} className="flex-1 rounded-full transition-colors"
                        style={{ background: strength.score >= i ? strength.color : "#E2E8F0" }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>
                    Força da senha: {strength.label}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-synk-danger">
                  <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.password}
                </p>
              )}
            </div>

            <FieldRow id="confirmPassword" type="password" label="Confirmar senha" icon={Lock}
              placeholder="Repita a senha" value={data.confirmPassword} error={errors.confirmPassword}
              onChange={(v) => update("confirmPassword", v)} onBlur={() => blur("confirmPassword")}
              autoComplete="new-password" hidePasswordToggle />

            <Button type="submit" className="h-11 w-full bg-synk-indigo text-[15px] font-semibold hover:bg-synk-indigo-hover">
              Continuar →
            </Button>
          </form>

          <p className="text-center text-sm text-[#64748B]">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-synk-indigo hover:text-synk-indigo-hover">Entrar</Link>
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-synk-navy">Conte sobre sua empresa</h1>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Isso ajuda o Synk a personalizar sua experiência desde o primeiro acesso.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-5" noValidate>
            <FieldRow id="companyName" label="Nome da empresa" icon={Building2}
              placeholder="Razão social ou nome fantasia" value={data.companyName} error={errors.companyName}
              onChange={(v) => update("companyName", v)} onBlur={() => blur("companyName")} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-synk-navy">Segmento</Label>
                <Select value={data.segment} onValueChange={(v) => { update("segment", v); setTouched((t) => ({ ...t, segment: true })) }}>
                  <SelectTrigger className={`h-11 ${errors.segment ? "border-synk-danger focus:ring-synk-danger/40" : ""}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                {errors.segment && (
                  <p className="flex items-center gap-1.5 text-xs text-synk-danger">
                    <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.segment}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-synk-navy">Tamanho</Label>
                <Select value={data.size} onValueChange={(v) => { update("size", v); setTouched((t) => ({ ...t, size: true })) }}>
                  <SelectTrigger className={`h-11 ${errors.size ? "border-synk-danger focus:ring-synk-danger/40" : ""}`}>
                    <SelectValue placeholder="Funcionários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1 a 5</SelectItem>
                    <SelectItem value="6-20">6 a 20</SelectItem>
                    <SelectItem value="21-50">21 a 50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.size && (
                  <p className="flex items-center gap-1.5 text-xs text-synk-danger">
                    <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.size}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnpj" className="flex items-center justify-between text-[13px] font-medium text-synk-navy">
                CNPJ
                <span className="text-xs font-normal text-[#94A3B8]">Opcional</span>
              </Label>
              <Input
                id="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00"
                value={data.cnpj} onChange={(e) => update("cnpj", maskCNPJ(e.target.value))}
                onBlur={() => blur("cnpj")} aria-invalid={!!errors.cnpj}
                className={`h-11 font-mono ${errors.cnpj ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
              />
              {errors.cnpj && (
                <p className="flex items-center gap-1.5 text-xs text-synk-danger">
                  <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.cnpj}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[#E2E8F0] bg-white p-3 transition-colors has-[:checked]:border-synk-indigo has-[:checked]:bg-synk-indigo-light/40">
              <Checkbox
                checked={data.acceptedTerms}
                onCheckedChange={(v) => { update("acceptedTerms", v === true); setTouched((t) => ({ ...t, acceptedTerms: true })) }}
                className="mt-0.5 border-[#94A3B8] data-[state=checked]:border-synk-indigo data-[state=checked]:bg-synk-indigo"
              />
              <span className="text-sm leading-relaxed text-[#334155]">
                Aceito os{" "}
                <Link href="/terms" className="font-medium text-synk-indigo hover:underline">Termos de Uso</Link>{" "}
                e a{" "}
                <Link href="/privacy" className="font-medium text-synk-indigo hover:underline">Política de Privacidade</Link>{" "}
                (LGPD).
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="flex items-center gap-1.5 text-xs text-synk-danger">
                <AlertCircle className="size-3.5" strokeWidth={1.5} />{errors.acceptedTerms}
              </p>
            )}

            {submitError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-md border border-synk-danger/20 bg-synk-danger-bg/50 px-3.5 py-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-synk-danger" strokeWidth={1.5} />
                <p className="text-sm text-synk-danger">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting}
                className="h-11 w-full bg-synk-indigo text-[15px] font-semibold hover:bg-synk-indigo-hover">
                {isSubmitting ? (
                  <><Loader2 className="size-4 animate-spin" strokeWidth={1.5} />Criando sua conta...</>
                ) : (
                  <><Check className="size-4" strokeWidth={2} />Criar conta grátis</>
                )}
              </Button>
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => setStep(1)}
                className="h-10 w-full text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-synk-navy">
                <ArrowLeft className="size-4" strokeWidth={1.5} />Voltar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function FieldRow({
  id, label, icon: Icon, placeholder, value, error, onChange, onBlur,
  type = "text", autoComplete, hidePasswordToggle,
}: {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  placeholder?: string
  value: string
  error?: string
  onChange: (v: string) => void
  onBlur: () => void
  type?: string
  autoComplete?: string
  hidePasswordToggle?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium text-synk-navy">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
        <Input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          autoComplete={autoComplete} aria-invalid={!!error}
          className={`h-11 pl-10 ${error ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""} ${hidePasswordToggle ? "" : ""}`}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-synk-danger">
          <AlertCircle className="size-3.5" strokeWidth={1.5} />{error}
        </p>
      )}
    </div>
  )
}
