"use client"

import { useState, type ReactNode } from "react"
import type { MeData } from "@/app/actions/auth"
import type { AppNotification } from "@/app/actions/notifications"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

interface DashboardShellProps {
  children: ReactNode
  me: MeData | null
  notifications: AppNotification[]
}

export function DashboardShell({ children, me, notifications }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} me={me} />
      </div>

      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} me={me} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} me={me} notifications={notifications} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
