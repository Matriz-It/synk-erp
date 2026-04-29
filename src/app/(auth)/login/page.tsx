import { LoginForm } from "@/components/auth/login-form"
import { SynkLogo } from "@/components/synk-logo"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-10">
      <div className="flex items-center justify-between lg:hidden">
        <SynkLogo variant="light" />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-synk-navy">
          Bem-vindo de volta
        </h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          Entre na sua conta Synk para continuar gerenciando seu negócio.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-[#64748B]">
        Não tem conta?{" "}
        <Link
          href="/signup"
          className="font-semibold text-synk-indigo transition-colors hover:text-synk-indigo-hover"
        >
          Criar conta grátis →
        </Link>
      </p>
    </div>
  )
}
