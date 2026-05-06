"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronLeft, ChevronsUpDown, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { SynkLogo } from "@/components/synk-logo"
import { NAVIGATION, type NavItem } from "@/components/dashboard/navigation"
import { logoutAction, type MeData } from "@/app/actions/auth"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  me: MeData | null
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '??'
}

function formatCNPJ(raw: string | null): string {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '').padStart(14, '0')
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', user: 'Usuário' }
const PLAN_LABEL: Record<string, string> = { free: 'Plano Free', pro: 'Plano Pro', enterprise: 'Enterprise' }

export function Sidebar({ collapsed, onToggleCollapse, me }: SidebarProps) {
  return (
    <aside
      className={cn(
        "sidebar-scroll sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-[#1E293B] bg-synk-navy transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Navegação principal"
    >
      <SidebarHeader collapsed={collapsed} me={me} />
      <nav className="flex-1 px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {NAVIGATION.map((item) => <SidebarItem key={item.href} item={item} collapsed={collapsed} />)}
        </ul>
      </nav>
      <SidebarFooter collapsed={collapsed} onToggleCollapse={onToggleCollapse} me={me} />
    </aside>
  )
}

function SidebarHeader({ collapsed, me }: { collapsed: boolean; me: MeData | null }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#1E293B] p-3">
      <div className="flex h-10 items-center px-2">
        {collapsed ? <SynkLogo variant="dark" showWordmark={false} /> : <SynkLogo variant="dark" />}
      </div>
      {!collapsed && <CompanySwitcher me={me} />}
    </div>
  )
}

function CompanySwitcher({ me }: { me: MeData | null }) {
  const tenantName = me?.tenant.name || 'Minha Empresa'
  const cnpj = formatCNPJ(me?.tenant.document ?? null)
  const plan = PLAN_LABEL[me?.tenant.plan ?? ''] ?? ''
  const avatarLetters = initials(tenantName)

  return (
    <button type="button" className="group flex w-full items-center gap-2.5 rounded-md border border-[#1E293B] bg-[#1E293B]/50 p-2 text-left transition-colors hover:border-synk-indigo/40 hover:bg-[#1E293B]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-synk-indigo text-[13px] font-bold text-white">
        {avatarLetters}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-white">{tenantName}</span>
        <span className="block truncate text-[11px] text-[#94A3B8]">
          {cnpj ? `CNPJ ${cnpj}` : plan}
        </span>
      </span>
      <ChevronsUpDown className="size-4 shrink-0 text-[#64748B] group-hover:text-[#94A3B8]" strokeWidth={1.5} />
    </button>
  )
}

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname()
  const Icon = item.icon
  const hasChildren = !!item.children?.length
  const isExactActive = pathname === item.href
  const isWithinGroup = pathname.startsWith(item.href) && item.href !== "/dashboard"
  const isActive = isExactActive || (hasChildren && isWithinGroup)
  const [open, setOpen] = useState(isActive && hasChildren)

  if (collapsed) {
    return (
      <li>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-10 items-center justify-center rounded-md transition-colors",
                  isActive ? "bg-synk-indigo/20 text-synk-indigo-hover" : "text-[#94A3B8] hover:bg-white/5 hover:text-white",
                )}
                aria-current={isExactActive ? "page" : undefined}
              >
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-synk-indigo" />}
                <Icon className="size-5" strokeWidth={1.5} />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-synk-navy text-white border-[#1E293B]">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </li>
    )
  }

  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors",
            isActive ? "bg-synk-indigo/20 text-synk-indigo-hover" : "text-[#94A3B8] hover:bg-white/5 hover:text-white",
          )}
        >
          {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-synk-indigo" />}
          <Icon className={cn("size-5", isActive ? "text-synk-indigo-hover" : "text-[#64748B]")} strokeWidth={1.5} />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn("size-4 transition-transform text-[#64748B]", open && "rotate-180")} strokeWidth={1.5} />
        </button>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "relative flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors",
            isActive ? "bg-synk-indigo/20 text-synk-indigo-hover" : "text-[#94A3B8] hover:bg-white/5 hover:text-white",
          )}
          aria-current={isExactActive ? "page" : undefined}
        >
          {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-synk-indigo" />}
          <Icon className={cn("size-5", isActive ? "text-synk-indigo-hover" : "text-[#64748B]")} strokeWidth={1.5} />
          <span>{item.label}</span>
        </Link>
      )}

      {hasChildren && open && (
        <ul className="mt-0.5 space-y-0.5 pl-10">
          {item.children!.map((sub) => {
            const subActive = pathname === sub.href
            return (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-[13px] transition-colors",
                    subActive ? "text-synk-indigo-hover font-semibold" : "text-[#94A3B8] hover:text-white",
                  )}
                  aria-current={subActive ? "page" : undefined}
                >
                  {sub.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

function SidebarFooter({ collapsed, onToggleCollapse, me }: { collapsed: boolean; onToggleCollapse: () => void; me: MeData | null }) {
  const userName = me?.user.name || me?.user.email || '—'
  const roleLabel = ROLE_LABEL[me?.user.role ?? ''] ?? me?.user.role ?? ''
  const userInitials = initials(userName)

  return (
    <div className="border-t border-[#1E293B] p-3">
      <div className={cn("flex items-center gap-3 rounded-md p-2", collapsed && "justify-center")}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#334155] text-[12px] font-semibold text-white">{userInitials}</span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{userName}</p>
              <p className="truncate text-[11px] text-[#94A3B8]">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={async () => { await logoutAction(); window.location.replace('/login') }}
              className="rounded-md p-1.5 text-[#64748B] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Sair"
            >
              <LogOut className="size-4" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="mt-2 flex h-8 w-full items-center justify-center gap-2 rounded-md text-[12px] font-medium text-[#64748B] transition-colors hover:bg-white/5 hover:text-white"
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} strokeWidth={1.5} />
        {!collapsed && "Recolher"}
      </button>
    </div>
  )
}
