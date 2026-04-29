import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SynkLogo } from "@/components/synk-logo"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex items-center justify-between lg:hidden">
        <SynkLogo variant="light" />
      </div>

      <div className="space-y-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-synk-navy"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          Voltar ao login
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight text-synk-navy">
          Redefinir senha
        </h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
