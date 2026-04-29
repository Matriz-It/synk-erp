import type { ReactNode } from "react"
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full bg-[#F8F9FC] lg:grid-cols-[minmax(420px,_1fr)_1.1fr]">
      <AuthBrandPanel />
      <main className="flex min-h-screen w-full items-center justify-center px-6 py-10 sm:px-10">
        {children}
      </main>
    </div>
  )
}
