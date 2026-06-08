import type { ReactNode } from "react"
import { getMeAction } from "@/app/actions/auth"
import { getNotificationsAction } from "@/app/actions/notifications"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [me, notifications] = await Promise.all([
    getMeAction(),
    getNotificationsAction().catch(() => []),
  ])
  return <DashboardShell me={me} notifications={notifications}>{children}</DashboardShell>
}
