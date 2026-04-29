import Link from "next/link"
import { Mail } from "lucide-react"
import { SynkLogo } from "@/components/synk-logo"
import { Button } from "@/components/ui/button"
import { ResendEmail } from "@/components/auth/resend-email"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  const target = email || "seu e-mail"

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
      <div className="flex w-full items-center justify-center lg:hidden">
        <SynkLogo variant="light" />
      </div>

      <div className="flex size-16 items-center justify-center rounded-2xl bg-synk-indigo-light">
        <Mail className="size-8 text-synk-indigo" strokeWidth={1.5} />
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-synk-navy">
          Verifique seu e-mail
        </h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          Enviamos um link de confirmação para{" "}
          <span className="font-semibold text-synk-navy">{target}</span>. Clique no link para
          ativar sua conta e começar a usar o Synk.
        </p>
      </div>

      <Button
        asChild
        variant="outline"
        className="h-11 w-full border-[#E2E8F0] bg-white text-sm font-medium text-synk-navy hover:bg-[#F8F9FC]"
      >
        <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
          Abrir meu Gmail
        </a>
      </Button>

      <div className="space-y-2 text-[13px]">
        <ResendEmail />
        <Link href="/signup" className="block text-[#94A3B8] hover:text-synk-navy">
          Trocar e-mail
        </Link>
      </div>
    </div>
  )
}
