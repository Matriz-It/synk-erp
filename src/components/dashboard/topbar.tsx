"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, ChevronRight, Menu, Search } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NAVIGATION } from "@/components/dashboard/navigation"
import { logoutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const crumbs = buildBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-synk-navy lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          return (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="size-3.5 text-[#94A3B8]" strokeWidth={1.5} />}
              {isLast ? (
                <span className="font-semibold text-synk-navy">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-[#94A3B8] hover:text-synk-navy">{crumb.label}</Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Buscar clientes, pedidos, produtos..."
            className={cn(
              "h-9 w-full rounded-md border border-[#E2E8F0] bg-[#F8F9FC] pl-9 pr-3 text-[13px] text-synk-navy outline-none transition-colors",
              "placeholder:text-[#94A3B8]",
              "focus:border-synk-indigo focus:bg-white focus:ring-2 focus:ring-synk-indigo/15",
            )}
          />
        </div>
      </div>

      <button type="button" aria-label="Notificações" className="relative rounded-md p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-synk-navy">
        <Bell className="size-5" strokeWidth={1.5} />
        <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-synk-danger text-[10px] font-bold text-white">3</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-[#F1F5F9]" aria-label="Menu do usuário">
            <span className="flex size-8 items-center justify-center rounded-full bg-synk-indigo text-[12px] font-semibold text-white">MS</span>
            <span className="hidden text-left lg:block">
              <span className="block text-[13px] font-semibold leading-tight text-synk-navy">Maria Silva</span>
              <span className="block text-[11px] leading-tight text-[#94A3B8]">Plano Pro</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-[#94A3B8]">maria@acme.com.br</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Meu perfil</DropdownMenuItem>
          <DropdownMenuItem>Minha empresa</DropdownMenuItem>
          <DropdownMenuItem>Plano atual</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logoutAction()} className="cursor-pointer text-synk-danger focus:text-synk-danger">Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

interface Crumb { label: string; href: string }

function buildBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Synk", href: "/dashboard" }]
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] !== "dashboard") return crumbs

  const allLinks = NAVIGATION.flatMap((item) => [
    { label: item.label, href: item.href },
    ...(item.children?.map((c) => ({ label: c.label, href: c.href })) ?? []),
  ])

  let current = ""
  segments.forEach((seg, idx) => {
    current += `/${seg}`
    if (idx === 0) { crumbs.push({ label: "Dashboard", href: "/dashboard" }); return }
    const found = allLinks.find((l) => l.href === current)
    if (found) crumbs.push(found)
  })

  return crumbs
}
