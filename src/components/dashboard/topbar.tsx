"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, ChevronRight, Menu, Search } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NAVIGATION } from "@/components/dashboard/navigation"
import { logoutAction, type MeData } from "@/app/actions/auth"
import { type AppNotification } from "@/app/actions/notifications"
import { cn } from "@/lib/utils"

interface TopbarProps {
  onMenuClick: () => void
  me: MeData | null
  notifications: AppNotification[]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '??'
}

const PLAN_LABEL: Record<string, string> = { free: 'Plano Free', pro: 'Plano Pro', enterprise: 'Enterprise' }

const TONE_COLOR: Record<AppNotification['tone'], string> = {
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3d3ebf',
}

function NotificationsButton({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<AppNotification[]>(initialNotifications)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notificações"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-synk-navy"
      >
        <Bell className="size-5" strokeWidth={1.5} />
        {notifs.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-synk-danger text-[10px] font-bold text-white">
            {notifs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] duration-150">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
            <span className="text-[14px] font-semibold text-synk-navy">Notificações</span>
            {notifs.length > 0 && (
              <button
                type="button"
                onClick={() => setNotifs([])}
                className="text-[11px] font-semibold text-synk-indigo transition-colors hover:text-synk-indigo-hover"
              >
                Marcar todas lidas
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="size-8 text-[#CBD5E1]" strokeWidth={1.5} />
              <p className="text-[13px] text-[#94A3B8]">Nenhuma notificação</p>
            </div>
          ) : (
            notifs.map((n, i) => (
              <div
                key={n.id}
                className={cn(
                  'flex cursor-pointer gap-2.5 px-4 py-3 transition-colors hover:bg-[#F8F9FC]',
                  i < notifs.length - 1 && 'border-b border-[#F1F5F9]',
                )}
              >
                <span className="mt-[5px] size-2 shrink-0 rounded-full" style={{ background: TONE_COLOR[n.tone] }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-synk-navy">{n.title}</p>
                  <p className="text-[12px] text-[#64748B]">{n.sub}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Topbar ───────────────────────────────────────────────────────

export function Topbar({ onMenuClick, me, notifications }: TopbarProps) {
  const userName = me?.user.name || me?.user.email || '—'
  const userInitials = initials(userName)
  const planLabel = PLAN_LABEL[me?.tenant.plan ?? ''] ?? ''
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

      <NotificationsButton initialNotifications={notifications} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-[#F1F5F9]" aria-label="Menu do usuário">
            <span className="flex size-8 items-center justify-center rounded-full bg-synk-indigo text-[12px] font-semibold text-white">{userInitials}</span>
            <span className="hidden text-left lg:block">
              <span className="block text-[13px] font-semibold leading-tight text-synk-navy">{userName}</span>
              <span className="block text-[11px] leading-tight text-[#94A3B8]">{planLabel}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-[#94A3B8]">{me?.user.email ?? ''}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Meu perfil</DropdownMenuItem>
          <DropdownMenuItem>Minha empresa</DropdownMenuItem>
          <DropdownMenuItem>Plano atual</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => { await logoutAction(); window.location.replace('/login') }}
            className="cursor-pointer text-synk-danger focus:text-synk-danger"
          >
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

interface Crumb { label: string; href: string }

function buildBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }]
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] !== "dashboard") return crumbs

  const allLinks = NAVIGATION.flatMap((item) => [
    { label: item.label, href: item.href },
    ...(item.children?.map((c) => ({ label: c.label, href: c.href })) ?? []),
  ])

  let current = ""
  segments.forEach((seg, idx) => {
    current += `/${seg}`
    if (idx === 0) return
    const found = allLinks.find((l) => l.href === current)
    if (found) crumbs.push(found)
  })

  return crumbs
}
