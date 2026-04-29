"use client"

import { useState, type FormEvent } from "react"
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) return setError("Informe seu e-mail")
    if (!emailRegex.test(email)) return setError("Formato de e-mail inválido")

    setError(null)
    setState("sending")
    await new Promise((r) => setTimeout(r, 1000))
    setState("sent")
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-md border border-synk-success/20 bg-synk-success-bg/50 p-4"
      >
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-synk-success"
          strokeWidth={1.5}
        />
        <div>
          <p className="text-sm font-semibold text-synk-navy">E-mail enviado</p>
          <p className="mt-1 text-sm leading-relaxed text-[#334155]">
            Confira sua caixa de entrada em{" "}
            <span className="font-semibold">{email}</span>. O link expira em 1 hora.
          </p>
        </div>
      </div>
    )
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
            placeholder="seu@email.com.br"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            disabled={state === "sending"}
            aria-invalid={!!error}
            className={`h-11 pl-10 ${error ? "border-synk-danger focus-visible:ring-synk-danger/40" : ""}`}
          />
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-synk-danger">
            <AlertCircle className="size-3.5" strokeWidth={1.5} />
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={state === "sending"}
        className="h-11 w-full bg-synk-indigo text-[15px] font-semibold hover:bg-synk-indigo-hover"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            Enviando link...
          </>
        ) : (
          "Enviar link de redefinição"
        )}
      </Button>
    </form>
  )
}
