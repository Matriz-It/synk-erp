"use client"

import { useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ResendEmail() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")

  async function handleResend() {
    if (state !== "idle") return
    setState("sending")
    await new Promise((r) => setTimeout(r, 900))
    setState("sent")
    setTimeout(() => setState("idle"), 4000)
  }

  if (state === "sent") {
    return (
      <p className="flex items-center justify-center gap-1.5 text-synk-success">
        <CheckCircle2 className="size-3.5" strokeWidth={1.5} />
        E-mail reenviado com sucesso
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={state === "sending"}
      className="inline-flex items-center gap-1.5 font-medium text-synk-indigo transition-colors hover:text-synk-indigo-hover disabled:opacity-60"
    >
      {state === "sending" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
          Reenviando...
        </>
      ) : (
        "Não recebeu? Reenviar e-mail"
      )}
    </button>
  )
}
